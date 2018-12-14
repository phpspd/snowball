var io = require('socket.io');
var express = require('express');
var app = express();
var http = require('http');

var server = http.createServer(app);
var io = io.listen(server);

server.listen(1445);

const COLORS = ['red', 'blue', 'green'];
const SPAWN_SPOTS = [
    {
        x: 0,
        y: 0
    }, {
        x: 100,
        y: 0
    }, {
        x: 200,
        y: 0
    }, {
        x: 300,
        y: 0
    }, {
        x: 400,
        y: 0
    }
];

let players = []
    , playersCount = 0
    , snowballs = []
    , snowballsCount = 0
    ;

function newPlayer(socket) {
    let i = Math.floor(Math.random() * 100) % (SPAWN_SPOTS.length - 1);
    let spot = SPAWN_SPOTS[i];
    let num = ++playersCount;
    let obj = {
        socketId: socket.id,
        color: COLORS.shift(),
        x: spot.x,
        y: spot.y,
        name: 'Player #' + num,
        num: num,
        speedX: 0,
        speedY: 0
    }
    players.push(obj);
    
    return obj;
}

function newSnowball(player, x, y, direction) {
    let num = ++snowballsCount;
    let obj = {
        player: player,
        num: num,
        x: x,
        y: y,
        direction: direction
    };

    snowballs.push(obj);

    return obj;
}

function convertPlayerForResponse(player) {
    return {
        color: player.color,
        num: player.num,
        name: player.name,
        x: player.x,
        y: player.y,
        direction: player.direction,
        speedX: player.speedX,
        speedY: player.speedY
    }
}

function convertSnowballForResponse(snowball) {
    return {
        player: snowball.player.num,
        num: snowball.num,
        x: snowball.x,
        y: snowball.y,
        direction: snowball.direction
    };
}

function respawnPlayer(player) {
    let i = Math.floor(Math.random() * 100) % (SPAWN_SPOTS.length - 1);
    let spot = SPAWN_SPOTS[i];
    player.x = spot.x;
    player.y = spot.y;

    return player;
}

function getPlayerBySocket(socket) {
    let player = players.find((item) => { return item.socketId === socket.id });
    return player;
}

io.sockets.on('connection', function (socket) {
    let player = newPlayer(socket);
    //players.push(player);
    //socket.player = player;
    socket.on('disconnect', function () {
        let player = getPlayerBySocket(this);
        COLORS.unshift(player.color);
        players = players.filter((item) => { return item.num !== player.num });
        io.emit('removePlayer', { num: player.num });
    });
    socket.emit('initPlayer', {
        you: convertPlayerForResponse(player),
        players: players.map((item) => { return convertPlayerForResponse(item) }),
        snowballs: snowballs.map((item) => { return convertSnowballForResponse(item) })
    });
    io.emit('newPlayer', convertPlayerForResponse(player));

    socket.on('snowball', function(data) {
        let player = getPlayerBySocket(this);
        let snowball = newSnowball(player, data.x, data.y, data.direction);
        io.emit('newSnowball', convertSnowballForResponse(snowball));
    });
    socket.on('voteKill', function(data) {
        let playerNum = data.player;
        let snowballNum = data.snowball;
        let killerNum = data.killer;
        let player = players.find((item) => { return item.num == playerNum });
        let killer = players.find((item) => { return item.num == killerNum });
        let snowball = snowballs.find((item) => { return item.num == snowballNum });
        if (player && snowball && killer && playerNum != killerNum) {
            player.voteKill = player.voteKill || 0;
            player.voteKill++;
            if (player.voteKill > players.length * 0.33) {
                snowballs = snowballs.filter((item) => { return item.num !== snowballNum });
                io.emit('playerKilled', { num: player.num });
                io.emit('snowballRemove', { num: snowball.num });
                player.killedTime = Date.now();
            }
        }
    });
    socket.on('pleaseRespawn', function(data) {
        let player = getPlayerBySocket(this);
        if (player.killedTime && Date.now() - player.killedTime >= 5000) {
            player.killedTime = 0;
            player.voteKill = 0;
            player = respawnPlayer(player);
            io.emit('playerRespawned', convertPlayerForResponse(player));
        }
    });
    socket.on('iamhere', function(data) {
        let player = getPlayerBySocket(this);
        if (player && !player.killedTime) {
            if (
                player.x !== data.x || player.y !== data.y
                || player.direction !== data.direction
                || player.speedX !== data.speedX
                || player.speedY !== data.speedY
            ) {
                player.x = data.x;
                player.y = data.y;
                player.direction = data.direction;
                player.speedX = data.speedX;
                player.speedY = data.speedY;

                io.emit('playerMoved', convertPlayerForResponse(player));
            }
        }
    });
    socket.on('voteSnowballRemove', function(data) {
        let snowballNum = data.num;
        let snowball = snowballs.find((item) => { return item.num == snowballNum });
        if (snowball) {
            snowball.voteRemove = snowball.voteRemove || 0;
            snowball.voteRemove++;
            if (snowball.voteRemove > players.length * 0.33) {
                snowballs = snowballs.filter((item) => { return item.num !== snowballNum });
                io.emit('snowballRemove', { num: snowball.num });
            }
        }
    });

    /*socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });*/
});