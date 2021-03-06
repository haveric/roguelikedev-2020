const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
const Srand = require("seeded-rand");

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rooms = {};
const lobbyStats = {
    numUsers: 0,
    numRooms: 0,
    playersInRooms: 0,
    spectatorsInRooms: 0
};
const lobby = {
    users: { }
};

let isDevMode = false;

// Command line arguments
const args = process.argv;
for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
        case "devmode":
            isDevMode = true;
            break;
        default:
            break;
    }
}

let minPlayersAllowed = 2;
if (isDevMode) {
    minPlayersAllowed = 1;
}

app.use(express.static(__dirname + "/src"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
    console.log("User connected: " + socket.id);

    addUserToLobby(socket);

    socket.on("disconnect", function () {
        console.log("User disconnected: " + socket.id);

        removeUserFromLobby(socket);
    });

    socket.on("server-createRoom", function(playerName) {
        const roomId = createRoomId();

        rooms[roomId] = {
            roomId: roomId,
            seed: generateRandomSeed(),
            gameState: "setup",
            players: [],
            spectators: []
        };

        console.log("Room Created: " + roomId + ", Seed: " + rooms[roomId].seed);

        moveUserToRoomCreate(socket, roomId);

        const newPlayer = createNewPlayer(socket, playerName);
        rooms[roomId].players.push(newPlayer);

        socket.emit("lobby-roomJoin", rooms[roomId]);
        socket.join("room-" + roomId);
    });

    socket.on("server-joinRoom", function(data) {
        const playerName = data.playerName;
        let roomId = data.roomId;
        if (roomId) {
            roomId = roomId.toUpperCase();
        } else {
            socket.emit("lobby-roomJoinFailed", "No room defined.");
            return;
        }

        const room = rooms[roomId];
        if (!room) {
            socket.emit("lobby-roomJoinFailed", "Room " + roomId + " does not exist.");
        } else {
            if (room.players.length < 2) {
                const newPlayer = createNewPlayer(socket, playerName);
                room.players.push(newPlayer);

                moveUserToRoomJoin(socket, roomId);

                io.sockets.in("room-" + roomId).emit("setup-roomAddPlayer", newPlayer);
                io.sockets.in("room-" + roomId).emit("setup-updatePlayer", { initialPlayerId: room.players[0].playerId, allPlayersReady: false });
            } else {
                room.spectators.push(socket.id);

                moveSpectatorToRoom(socket, roomId);
            }

            if (room.gameState === "setup") {
                socket.emit("lobby-roomJoin", room);
            } else if (room.gameState === "play") {
                socket.emit("lobby-startSpectatingGame", room);
            }

            socket.join("room-" + roomId);
        }
    });

    socket.on("server-roomUpdatePlayer", function(data) {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const room = rooms[roomId];
        const players = room.players;

        let player;
        for (let i = 0; i < players.length; i++) {
            const playerCheck = players[i];
            if (playerCheck.playerId === playerId) {
                player = playerCheck;
                break;
            }
        }

        if (player) {
            if (data.name) {
                player.name = data.name;
            }

            if (data.color) {
                player.color = data.color;
            }

            if (data.icon) {
                player.icon = data.icon;
            }

            if (data.ready !== null) {
                player.ready = data.ready;

                let allPlayersReady = true;

                if (players.length >= minPlayersAllowed) {
                    for (let i = 0; i < players.length; i++) {
                        if (!players[i].ready) {
                            allPlayersReady = false;
                            break;
                        }
                    }
                } else {
                    allPlayersReady = false;
                }

                io.sockets.in("room-" + roomId).emit("setup-updatePlayer", { player: player, initialPlayerId: players[0].playerId, allPlayersReady: allPlayersReady });
            } else {
                io.sockets.in("room-" + roomId).emit("setup-updatePlayer", { player: player });
            }
        }
    });

    socket.on("server-startGame", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;

        const room = rooms[roomId];
        const players = room.players;

        if (players[0].playerId === playerId) {
            room.gameState = "play";

            io.sockets.in("room-" + roomId).emit("setup-startGame", room);
        }
    });

    socket.on("server-performAction", function(data) {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const actionData = data.actionData;
        const useEnergy = data.useEnergy;

        const room = rooms[roomId];
        const players = room.players;

        let playerHasEnergy = false;
        if (useEnergy) {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];

                if (player.playerId === playerId) {
                    if (player.energy > 0) {
                        playerHasEnergy = true;
                        break;
                    }
                }
            }
        }

        if (!useEnergy || playerHasEnergy) {
            if (useEnergy) {
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];

                    if (player.playerId === playerId) {
                        player.energy -= 1;
                    } else {
                        if (player.alive && player.energy < player.energyMax) {
                            player.energy += 1;
                        }
                    }
                }
            }

            io.sockets.in("room-" + roomId).emit("game-performAction", { playerId: playerId, actionData: actionData });
            io.sockets.in("room-" + roomId).emit("game-updatePlayerData", players);
        }
    });

    socket.on("server-playerDied", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const room = rooms[roomId];
        const players = room.players;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.playerId === playerId) {
                player.alive = false;
            }
        }
    });

    socket.on("server-playerRevived", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const room = rooms[roomId];
        const players = room.players;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.playerId === playerId) {
                player.alive = true;
            }
        }
    });

    socket.on("server-createDebugRoom", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;

        io.sockets.in("room-" + roomId).emit("game-createDebugRoom");
    });

    /* TODO: Re-add once return to lobby works for scenes
    socket.on("server-endGameReturnToLobby", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;

        io.sockets.in("room-" + roomId).emit("game-endGameReturnToLobby");
        movePlayerFromRoomToLobby(socket, roomId);
    });
     */

    socket.on("server-endGameVoteRestart", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const room = rooms[roomId];
        const players = room.players;

        let numVotedToRestart = 0;
        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.playerId === playerId) {
                player.votedToRestart = true;
                numVotedToRestart += 1;
            } else if (player.votedToRestart) {
                numVotedToRestart += 1;
            }
        }

        if (numVotedToRestart === players.length) {
            // Reset player variables for a new game
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                player.energy = 5;
                player.energyMax = 10;
                player.alive = true;
                player.votedToRestart = false;
            }

            io.sockets.in("room-" + roomId).emit("game-endGameRestart");
        } else {
            io.sockets.in("room-" + roomId).emit("game-endGameVoteRestart", { playerId: playerId });
        }
    });

    socket.on("server-regenMap", function() {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const room = rooms[roomId];
        room.seed = generateRandomSeed();
        io.sockets.in("room-" + roomId).emit("game-regenMap", { seed: room.seed });
    });

    socket.on("server-updateEnergy", function(data) {
        const playerId = socket.id;
        const roomId = lobby.users[playerId].roomId;
        const giveEnergy = data.giveEnergy;

        const room = rooms[roomId];
        const players = room.players;

        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (player.alive) {
                if (player.playerId === playerId) {
                    if (data.energyMax !== undefined) {
                        player.energyMax = data.energyMax;
                    }

                    if (data.energy !== undefined) {
                        player.energy = data.energy;
                    } else {
                        player.energy -= 1;
                    }
                } else {
                    if (giveEnergy && player.energy < player.energyMax) {
                        player.energy += 1;
                    }
                }
            }
        }

        let numExhaustedPlayers = 0;
        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            if (!player.alive || player.energy === 0) {
                numExhaustedPlayers += 1;
            }
        }

        io.sockets.in("room-" + roomId).emit("game-updatePlayerData", players);

        // Game over
        if (numExhaustedPlayers === players.length) {
            io.sockets.in("room-" + roomId).emit("game-showEndGameDialog");
        }
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

function addUserToLobby(socket) {
    lobby.users[socket.id] = {
        userId: socket.id
    };

    lobbyStats.numUsers += 1;

    socket.emit("lobby-update", lobbyStats);
    socket.broadcast.emit("lobby-update", lobbyStats);
}

function removeUserFromLobby(socket) {
    const user = lobby.users[socket.id];
    if (user.roomId) {
        lobbyStats.playersInRooms -= 1;

        const room = rooms[user.roomId];
        let indexToDelete = -1;
        for (let i = 0; i < room.players.length; i++) {
            const player = room.players[i];
            if (player.playerId === socket.id) {
                indexToDelete = i;
                break;
            }
        }

        if (indexToDelete !== -1) {
            room.players.splice(indexToDelete, 1);
        }

        killRoom(socket, user.roomId);
    } else if (user.spectatorRoomId) {
        lobbyStats.spectatorsInRooms -= 1;

        const room = rooms[user.spectatorRoomId];
        let indexToDelete = -1;
        for (let i = 0; i < room.spectators.length; i++) {
            const player = room.spectators[i];
            if (player.playerId === socket.id) {
                indexToDelete = i;
                break;
            }
        }

        if (indexToDelete !== -1) {
            room.spectators.splice(indexToDelete, 1);
        }

        killRoom(socket, user.spectatorRoomId);
    } else {
        lobbyStats.numUsers -= 1;
    }

    delete lobby.users[socket.id];
    socket.broadcast.emit("lobby-update", lobbyStats);
}
/* TODO: Re-add once return to lobby works for scenes
function movePlayerFromRoomToLobby(socket, roomId) {
    const room = rooms[roomId];

    let indexToDelete = -1;
    for (let i = 0; i < room.players.length; i++) {
        const player = room.players[i];
        if (player.playerId === socket.id) {
            indexToDelete = i;
            break;
        }
    }

    if (indexToDelete !== -1) {
        room.players.splice(indexToDelete, 1);
    }

    killRoom(socket, roomId);
    lobbyStats.playersInRooms -= 1;
    addUserToLobby(socket);
}
 */

function moveUserToRoomCreate(socket, roomId) {
    lobbyStats.numRooms += 1;

    moveUserToRoomJoin(socket, roomId);
}

function moveUserToRoomJoin(socket, roomId) {
    lobbyStats.numUsers -= 1;
    lobbyStats.playersInRooms += 1;

    lobby.users[socket.id].roomId = roomId;

    socket.broadcast.emit("lobby-update", lobbyStats);
}

function moveSpectatorToRoom(socket, roomId) {
    lobbyStats.numUsers -= 1;
    lobbyStats.spectatorsInRooms += 1;

    lobby.users[socket.id].spectatorRoomId = roomId;

    socket.broadcast.emit("lobby-update", lobbyStats);
}

function killRoom(socket, roomId) {
    const room = rooms[roomId];

    if (room.players.length === 0 && room.spectators.length === 0) {
        delete rooms[roomId];
        lobbyStats.numRooms -= 1;

        socket.broadcast.emit("lobby-update", lobbyStats);
    }
}

function createRoomId() {
    let roomId;

    let success = false;
    while (!success) {
        roomId = generateRandomRoomId();
        if (!Object.prototype.hasOwnProperty.call(rooms, roomId)) {
            success = true;
        }
    }

    return roomId;
}

function generateRandomRoomId() {
    let roomId = "";
    for (let i = 0; i < 4; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return roomId;
}

function generateRandomSeed() {
    let num = "";
    for (let i = 0; i < 9; i++) {
        num += Srand.intInRange(0, 9);
    }
    return num;
}

function createNewPlayer(socket, playerName) {
    return {
        playerId: socket.id,
        name: playerName,
        color: "000000",
        sprite: "player",
        ready: false,
        x: 0,
        y: 0,
        energy: 5,
        energyMax: 10,
        alive: true,
        votedToRestart: false
    };
}