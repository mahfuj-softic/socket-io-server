var io = require('socket.io-client');
var socket = io.connect('http://localhost:6001', {reconnect: true});

// Add a connect listener
socket.on('connection', function (socket) {
    console.log('Connected!');
});
socket.emit('FromAPI');