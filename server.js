var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

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
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('User connected: ' + socket.id);

    lobby.users[socket.id] = {
        userId: socket.id
    }

    lobbyStats.numUsers += 1;


    socket.emit('lobbyUpdate', lobbyStats);
    socket.broadcast.emit('lobbyUpdate', lobbyStats);

    socket.on('disconnect', function () {
        console.log('User disconnected: ' + socket.id);

        // remove this player from our players object
        delete lobby.users[socket.id];
        lobbyStats.numUsers -= 1;

        socket.broadcast.emit('lobbyUpdate', lobbyStats);

        // emit a message to all players to remove this player
        //io.emit('disconnect', socket.id);
    });

    socket.on('createRoom', function(playerName) {
        var roomId = createRoomId();
        rooms[roomId] = {
            roomId: roomId,
            players: [],
            spectators: []
        };

        lobbyStats.numRooms += 1;
        lobbyStats.playersInRooms += 1;

        socket.emit('lobbyUpdate', lobbyStats);
        socket.broadcast.emit('lobbyUpdate', lobbyStats);

        var newPlayer = {
            playerId: socket.id,
            name: playerName,
            color: "#000000",
            icon: "@",
            ready: false
        }
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
                var newPlayer = {
                    playerId: socket.id,
                    name: playerName,
                    color: "#000000",
                    icon: "@",
                    ready: false
                }
                room.players.push(newPlayer);
                lobbyStats.playersInRooms += 1;

                io.sockets.in("room-" + roomId).emit("roomAddPlayer", newPlayer);
                io.sockets.in("room-" + roomId).emit("roomUpdatePlayer", { initialPlayerId: room.players[0].playerId, allPlayersReady: false });
            } else {
                room.spectators.push(socket.id);
                lobbyStats.spectatorsInRooms += 1;

                io.sockets.in("room-" + roomId).emit("roomAddSpectator", room);
            }

            socket.broadcast.emit('lobbyUpdate', lobbyStats);

            socket.emit("roomJoin", room);

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
                for (var i = 0; i < players.length; i++) {
                    if (players[i].ready == false) {
                        allPlayersReady = false;
                        break;
                    }
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
            room.players.forEach(function(player) {
                player.x = Math.floor(Math.random() * 600) + 100;
                player.y = Math.floor(Math.random() * 400) + 100;
            });

            io.sockets.in("room-" + roomId).emit("startGame", room);
        }
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (data) {
        var roomId = data.roomId;
        var playerId = data.playerId;
        var x = data.x;
        var y = data.y;

        var room = rooms[roomId];
        var players = room.players;

        var player;
        for (var i = 0; i < players.length; i++) {
            player = players[i];

            if (player.playerId == playerId) {
                player.x = x;
                player.y = y;
                break;
            }
        }

        // emit a message to all players about the player that moved
        io.sockets.in("room-" + roomId).emit("playerMoved", player);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

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
   for (var i = 0; i < 6; i++) {
       roomId += characters.charAt(Math.floor(Math.random() * characters.length));
   }

   return roomId;
}
