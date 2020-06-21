var socket = io();

var roomId;
var ready = false;

let getSiblings = function (e) {
    // for collecting siblings
    let siblings = [];
    // if no parent, return no sibling
    if(!e.parentNode) {
        return siblings;
    }
    // first child of the parent node
    let sibling  = e.parentNode.firstChild;

    // collecting siblings
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

socket.on('lobbyUpdate', function(lobbyStats) {
    var lobbyCount = document.getElementById("lobby-count");
    lobbyCount.innerText = lobbyStats.numUsers;

    var roomsCount = document.getElementById("rooms-count");
    roomsCount.innerText = lobbyStats.numRooms;

    var roomsPlayers = document.getElementById("rooms-players");
    roomsPlayers.innerText = lobbyStats.playersInRooms;

    var roomsSpectators = document.getElementById("rooms-spectators");
    roomsSpectators.innerText = lobbyStats.spectatorsInRooms;
});

socket.on('roomJoin', function(room) {
    roomId = room.roomId;

    var roomIdText = document.getElementById("roomId");
    roomIdText.innerText = room.roomId;

    var gameStates = document.getElementsByClassName("gameState");
    for (var i = 0; i < gameStates.length; i++) {
        var gameState = gameStates[i];
        gameState.classList.remove("active");
    }

    var roomWaiting = document.getElementById("room-waiting");
    roomWaiting.classList.add("active");

    updateRoomPlayers(room);
});

socket.on('roomAddPlayer', function(player) {
    addPlayer(player);
});

function updateRoomPlayers(room) {
    var players = document.getElementById("players");
    players.innerHtml = "";
    for (var i = 0; i < room.players.length; i++) {
        var player = room.players[i];

        addPlayer(player);
    }
}

function addPlayer(player) {
    var players = document.getElementById("players");

    var playerDiv = document.createElement("div");
    playerDiv.classList.add("room__player");
    playerDiv.setAttribute("data-player", player.playerId);

    var playerName;

    var currentPlayer = socket.id == player.playerId;
    if (currentPlayer) {
        playerDiv.classList.add("currentPlayer");
        playerName = document.createElement("input");
        playerName.id = "playerNameInput";
        playerName.value = player.name;

        playerName.addEventListener("input", function() {
            if (!ready) {
                socket.emit("roomUpdatePlayer", { roomId: roomId, playerId: socket.id, name: this.value });
            }
        });
    } else {
        playerName = document.createElement("div");
        playerName.innerText = player.name;
    }
    playerName.classList.add("room__player-name");

    var playerIcon = document.createElement("div");
    playerIcon.classList.add("room__player-icon");
    playerIcon.style.color = player.color;
    playerIcon.innerText = player.icon;


    playerDiv.appendChild(playerName);
    playerDiv.appendChild(playerIcon);

    if (currentPlayer) {
        var playerColors = document.createElement("div");
        playerColors.classList.add("room__player-colors");
        playerColors.classList.add("clearfix");

        var colors = [
            "#000000",
            "#00ee00",
            "#0000ee",
            "#00eeee",
            "#ee00ee"
        ];

        colors.forEach(function(color) {
            var playerColor = document.createElement("div");
            playerColor.classList.add("room__player-color");

            if (player.color == color) {
                playerColor.classList.add("active");
            }
            playerColor.style.backgroundColor = color;
            playerColors.appendChild(playerColor);

            playerColor.addEventListener("click", function() {
                if (!ready) {
                    socket.emit("roomUpdatePlayer", { roomId: roomId, playerId: socket.id, color: color });

                    this.classList.add("active");
                    var siblings = getSiblings(this);
                    siblings.forEach(function(sibling) {
                        sibling.classList.remove("active");
                    });

                    var parentSiblings = getSiblings(this.parentNode);
                    parentSiblings.forEach(function(sibling) {
                        if (sibling.classList.contains("room__player-icon")) {
                            sibling.style.color = color;
                        }
                    });
                }
            });
        });

        playerDiv.appendChild(playerColors);
    }

    var playerReady = document.createElement("div");
    playerReady.classList.add("room__player-ready");
    playerReady.innerText = "Ready? ";

    var playerReadyCheckbox = document.createElement("input");
    playerReadyCheckbox.type = "checkbox";
    playerReadyCheckbox.classList.add("player-ready");
    playerReadyCheckbox.checked = player.ready;

    if (currentPlayer) {
        playerReadyCheckbox.addEventListener("change", function() {
            ready = this.checked;
            socket.emit("roomUpdatePlayer", { roomId: roomId, playerId: socket.id, ready: this.checked });

            var playerNameInput = document.getElementById("playerNameInput");
            playerNameInput.disabled = ready;
        });
    } else {
        playerReadyCheckbox.setAttribute("disabled", "disabled");
    }

    playerReady.appendChild(playerReadyCheckbox);

    playerDiv.appendChild(playerReady);

    players.appendChild(playerDiv);
}

socket.on('roomJoinFailed', function(message) {
    var joinRoomError = document.getElementById("joinRoomError");
    joinRoomError.innerText = message;
});

var lobbyPlayerInput = document.getElementById("lobbyPlayerInput");
lobbyPlayerInput.addEventListener("input", function() {
    localStorage.setItem('playerName', lobbyPlayerInput.value);
});

var createRoomButton = document.getElementById("createRoom");
createRoomButton.addEventListener("click", function() {
    var playerName = document.getElementById("lobbyPlayerInput").value;
    socket.emit('createRoom', playerName);
});

var joinRoomButton = document.getElementById("joinRoom");
joinRoomButton.addEventListener("click", function() {
    var playerName = document.getElementById("lobbyPlayerInput").value;
    var roomIdInput = document.getElementById("joinRoomId");
    var roomId = roomIdInput.value;
    socket.emit('joinRoom', { roomId: roomId, playerName: playerName } );
});

var initialPlayerName = localStorage.getItem("playerName");
if (initialPlayerName) {
    lobbyPlayerInput.value = initialPlayerName;
}

socket.on('roomUpdatePlayer', function(data) {
    var players = document.getElementsByClassName("room__player");

    if (data.player && data.player.playerId != socket.id) {
        var playerId = data.player.playerId;

        for (i = 0; i < players.length; i++) {
            var player = players[i];
            if (player.getAttribute("data-player") == playerId) {
                var playerName = player.getElementsByClassName("room__player-name")[0];
                playerName.innerText = data.player.name;

                var playerName = player.getElementsByClassName("room__player-icon")[0];
                playerName.style.color = data.player.color;

                var playerReady = player.getElementsByClassName("player-ready")[0];
                playerReady.checked = data.player.ready;

                break;
            }
        }
    }

    if (data.allPlayersReady != null) {
        if (data.initialPlayerId == socket.id) {
            var roomWaiting = document.getElementById("room-waiting");
            var roomMenu = roomWaiting.getElementsByClassName("room__menu")[0];

            if (data.allPlayersReady) {
                roomMenu.classList.add("active");
            } else {
                roomMenu.classList.remove("active");
            }
        }
    }
});

var startGame = document.getElementById("startGame");
startGame.addEventListener("click", function() {
    socket.emit('startGame', { roomId: roomId, playerId: socket.id } );
});

var joinRoomId = document.getElementById("joinRoomId");
joinRoomId.value = "";


var config = {
    type: Phaser.AUTO,
    parent: 'room-game',
    width: 800,
    height: 600,
    pixelArt: true,
    backgroundColor: "#ccc",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    //this.load.image('transparent', 'assets/transparent.png');
}

function create() {
    var self = this;
    this.otherPlayers = this.add.group();

    socket.on('startGame', function(room) {
        var gameStates = document.getElementsByClassName("gameState");
        for (var i = 0; i < gameStates.length; i++) {
            var gameState = gameStates[i];
            gameState.classList.remove("active");
        }

        var roomGame = document.getElementById("room-game");
        roomGame.classList.add("active");

        Object.keys(room.players).forEach(function(index) {
            var player = room.players[index];
            if (player.playerId == socket.id) {
                var style = {font: "30px Arial", fill: player.color };
                var text = self.add.text(player.x, player.y, player.icon, style);

                self.player = text;
            } else {
                var style = {font: "30px Arial", fill: player.color };
                var text = self.add.text(player.x, player.y, player.icon, style);
                text.playerId = player.playerId;

                self.otherPlayers.add(text);
            }
        });
    });

    socket.on('playerMoved', function(data) {

    });

    var canMoveLeft = true;
    var canMoveRight = true;
    var canMoveUp = true;
    var canMoveDown = true;
    //  Left
    this.input.keyboard.on('keydown_A', function (event) {
        if (canMoveLeft) {
            movePlayer(self.player, -32, 0);
            canMoveLeft = false;
        }
    });
    this.input.keyboard.on('keyup_A', function (event) {
        canMoveLeft = true;
    });

    //  Right
    this.input.keyboard.on('keydown_D', function (event) {
        if (canMoveRight) {
            movePlayer(self.player, 32, 0);
            canMoveRight = false;
        }
    });
    this.input.keyboard.on('keyup_D', function (event) {
        canMoveRight = true;
    });

    //  Up
    this.input.keyboard.on('keydown_W', function (event) {
        if (canMoveUp) {
            movePlayer(self.player, 0, -32);
            canMoveUp = false;
        }
    });
    this.input.keyboard.on('keyup_W', function (event) {
        canMoveUp = true;
    });

    //  Down
    this.input.keyboard.on('keydown_S', function (event) {
        if (canMoveDown) {
            movePlayer(self.player, 0, 32);
            canMoveDown = false;
        }
    });
    this.input.keyboard.on('keyup_S', function (event) {
        canMoveDown = true;
    });

    socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.x = playerInfo.x;
                otherPlayer.y = playerInfo.y;
            }
        });
    });
}

function update() {

}

function movePlayer(player, x, y) {
    if (player) {
        player.x += x;
        player.y += y;

        socket.emit('playerMovement', { roomId: roomId, playerId: socket.id, x: player.x, y: player.y });
    }
}