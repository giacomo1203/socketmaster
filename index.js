var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3030;

server.listen(port, function () {
    'use strict';
    console.log('Server corriendo en port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

var numUsers = 0;

io.on('connection', function (socket) {
    'use strict';
    var addedUser = false;
    socket.on('nuevo mensaje', function (data) {
        socket.broadcast.emit('nuevo mensaje', {
            username: socket.username,
            message: data
        });
    });

    socket.on('nuevo usuario', function (username) {
        if (addedUser) {
            return;
        }

        socket.username = username;
        numUsers = numUsers + 1;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.emit('ingreso usuario', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('tipeando', function () {
        socket.broadcast.emit('tipeando', {
            username: socket.username
        });
    });

    socket.on('dejo tipeo', function () {
        socket.broadcast.emit('dejo tipeo', {
            username: socket.username
        });
    });

    socket.on('desconectado', function () {
        if (addedUser) {
            numUsers = numUsers - 1;
            // echo globally that this client has left
            socket.broadcast.emit('usuario dejo la sala', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});