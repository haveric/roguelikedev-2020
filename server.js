var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var create2dArray = require('./utils.js').create2dArray;
var getRandomInt = require('./utils.js').getRandomInt;

var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var rooms = {};
var lobbyStats = {
    numUsers: 0,
    numRooms: 0,
    playersInRooms: 0,
    spectatorsInRooms: 0
};
var lobby = {
    users: { }
};

app.use(express.static(__dirname + '/src'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('User connected: ' + socket.id);

    addUserToLobby(socket);

    socket.on('disconnect', function () {
        console.log('User disconnected: ' + socket.id);

        removeUserFromLobby(socket);
    });

    socket.on('createRoom', function(playerName) {
        var roomId = createRoomId();

        rooms[roomId] = {
            roomId: roomId,
            seed: generateRandomSeed(),
            gameState: "setup",
            players: [],
            spectators: []
        };

        console.log("Room Created: " + roomId + ", Seed: " + rooms[roomId].seed);

        moveUserToRoomCreate(socket, roomId);

        var newPlayer = createNewPlayer(socket, playerName);
        rooms[roomId].players.push(newPlayer);

        socket.emit("roomJoin", rooms[roomId]);
        socket.join("room-" + roomId);
    });

    socket.on('joinRoom', function(data) {
        var playerName = data.playerName;
        var roomId = data.roomId;
        if (roomId) {
            roomId = roomId.toUpperCase();
        } else {
            socket.emit("roomJoinFailed", "No room defined.");
            return;
        }

        var room = rooms[roomId];
        if (!room) {
            socket.emit("roomJoinFailed", "Room " + roomId + " does not exist.");
        } else {
            if (room.players.length < 2) {
                var newPlayer = createNewPlayer(socket, playerName);
                room.players.push(newPlayer);

                moveUserToRoomJoin(socket, roomId);

                io.sockets.in("room-" + roomId).emit("roomAddPlayer", newPlayer);
                io.sockets.in("room-" + roomId).emit("roomUpdatePlayer", { initialPlayerId: room.players[0].playerId, allPlayersReady: false });
            } else {
                room.spectators.push(socket.id);

                moveSpectatorToRoom(socket, roomId);
            }

            if (room.gameState == "setup") {
                socket.emit("roomJoin", room);
            } else if (room.gameState == "play") {
                socket.emit("startSpectatingGame", room);
            }

            socket.join("room-" + roomId);
        }
    });

    socket.on('roomUpdatePlayer', function(data) {
        var roomId = data.roomId;
        var playerId = data.playerId;

        var room = rooms[roomId];
        var players = room.players;

        var player;
        for (var i = 0; i < players.length; i++) {
            var playerCheck = players[i];
            if (playerCheck.playerId == playerId) {
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

            if (data.ready != null) {
                player.ready = data.ready;

                var allPlayersReady = true;
                if (players.length >= 2) {
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].ready == false) {
                            allPlayersReady = false;
                            break;
                        }
                    }
                } else {
                    allPlayersReady = false;
                }

                io.sockets.in("room-" + roomId).emit("roomUpdatePlayer", { player: player, initialPlayerId: players[0].playerId, allPlayersReady: allPlayersReady });
            } else {
                io.sockets.in("room-" + roomId).emit("roomUpdatePlayer", { player: player });
            }
        }
    });

    socket.on('startGame', function(data) {
        var roomId = data.roomId;
        var playerId = data.playerId;

        var room = rooms[roomId];
        var players = room.players;

        if (players[0].playerId == playerId) {
            room.gameState = "play";

            // TODO: Remove to let client handle positioning?
            room.players.forEach(function(player) {
                player.x = getRandomInt(1, 18);
                player.y = getRandomInt(1, 18);
            });

            io.sockets.in("room-" + roomId).emit("startGame", room);
        }
    });

    socket.on('s-performAction', function(data) {
        var roomId = data.roomId;
        var playerId = data.playerId;
        var actionData = data.actionData;
        var useEnergy = data.useEnergy;

        var room = rooms[roomId];
        var players = room.players;

        var playerHasEnergy = false;
        if (useEnergy) {
            for (var i = 0; i < players.length; i++) {
                var player = players[i];

                if (player.playerId == playerId) {
                    if (player.energy > 0) {
                        playerHasEnergy = true;
                        break;
                    }
                }
            }
        }

        if (!useEnergy || playerHasEnergy) {
            if (useEnergy) {
                for (var i = 0; i < players.length; i++) {
                    var player = players[i];

                    if (player.playerId == playerId) {
                        player.energy -= 1;
                    } else {
                        if (player.energy < player.energyMax) {
                            player.energy += 1;
                        }
                    }
                }
            }

            io.sockets.in("room-" + roomId).emit("c-performAction", { playerId: playerId, actionData: actionData });
            io.sockets.in("room-" + roomId).emit("updatePlayerData", players);
        }
    });

    socket.on('s-createDebugRoom', function(data) {
        var roomId = data.roomId;
        var playerId = data.playerId;

        io.sockets.in("room-" + roomId).emit("c-createDebugRoom", { playerId: playerId });
    });

    socket.on('s-regenMap', function(data) {
        var roomId = data.roomId;
        var room = rooms[roomId];
        room.seed = generateRandomSeed();
        io.sockets.in("room-" + roomId).emit("c-regenMap", { seed: room.seed });
    });

    socket.on('updateEnergy', function(data) {
        var roomId = data.roomId;
        var playerId = data.playerId;

        var room = rooms[roomId];
        var players = room.players;

        var updatedPlayer;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];

            if (player.playerId == playerId) {
                updatedPlayer = player;

                if (data.energyMax) {
                    player.energyMax = data.energyMax;
                }

                if (data.energy) {
                    player.energy = data.energy;
                } else {
                    player.energy -= 1;
                }
            } else {
                if (player.energy < player.energyMax) {
                    player.energy += 1;
                }
            }
        }

        io.sockets.in("room-" + roomId).emit("updatePlayerData", players);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

function addUserToLobby(socket) {
    lobby.users[socket.id] = {
        userId: socket.id
    }

    lobbyStats.numUsers += 1;

    socket.emit('lobbyUpdate', lobbyStats);
    socket.broadcast.emit('lobbyUpdate', lobbyStats);
}

function removeUserFromLobby(socket) {
    var user = lobby.users[socket.id];
    if (user.roomId) {
        lobbyStats.playersInRooms -= 1;

        var room = rooms[user.roomId];
        var indexToDelete = -1;
        for (var i = 0; i < room.players.length; i++) {
            var player = room.players[i];
            if (player.playerId == socket.id) {
                indexToDelete = i;
                break;
            }
        }

        if (indexToDelete != -1) {
            room.players.splice(indexToDelete, 1);
        }

        killRoom(socket, user.roomId);
    } else if (user.spectatorRoomId) {
        lobbyStats.spectatorsInRooms -= 1;

        var room = rooms[user.spectatorRoomId];
        var indexToDelete = -1;
        for (var i = 0; i < room.spectators.length; i++) {
            var player = room.spectators[i];
            if (player.playerId == socket.id) {
                indexToDelete = i;
                break;
            }
        }

        if (indexToDelete != -1) {
            room.spectators.splice(indexToDelete, 1);
        }

        killRoom(socket, user.spectatorRoomId);
    } else {
        lobbyStats.numUsers -= 1;
    }

    delete lobby.users[socket.id];
    socket.broadcast.emit('lobbyUpdate', lobbyStats);
}

function moveUserToRoomCreate(socket, roomId) {
    lobbyStats.numRooms += 1;

    moveUserToRoomJoin(socket, roomId);
}

function moveUserToRoomJoin(socket, roomId) {
    lobbyStats.numUsers -= 1;
    lobbyStats.playersInRooms += 1;

    lobby.users[socket.id].roomId = roomId;

    socket.broadcast.emit('lobbyUpdate', lobbyStats);
}

function moveSpectatorToRoom(socket, roomId) {
    lobbyStats.numUsers -= 1;
    lobbyStats.spectatorsInRooms += 1;

    lobby.users[socket.id].spectatorRoomId = roomId;

    socket.broadcast.emit('lobbyUpdate', lobbyStats);
}

function killRoom(socket, roomId) {
    var room = rooms[roomId];

    if (room.players.length == 0 && room.spectators.length == 0) {
        delete rooms[roomId];
        lobbyStats.numRooms -= 1;

        socket.broadcast.emit('lobbyUpdate', lobbyStats);
    }
}

function createRoomId() {
    var roomId;

    var success = false;
    while (!success) {
        roomId = generateRandomRoomId();
        if (!rooms.hasOwnProperty(roomId)) {
            success = true;
        }
    }

    return roomId;
}

function generateRandomRoomId() {
   var roomId = "";
   for (var i = 0; i < 4; i++) {
       roomId += characters.charAt(Math.floor(Math.random() * characters.length));
   }

   return roomId;
}

function generateRandomSeed() {
    var num = "";
    for (var i = 0; i < 9; i++) {
        num += getRandomInt(0, 9);
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
        energy: 5,
        energyMax: 10
    }
}