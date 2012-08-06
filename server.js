var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var nicknames = [];
var users = {};

server.listen(80);

app.use(express.static(__dirname + "/public"));

io.sockets.on('connection', function (socket) {

  // User asking for a nickname
  socket.on('nickname', function (nickname, callback) {

    if (users[nickname]) {
      callback(false);
    } else {
      socket.set('nickname', nickname);
      socket.broadcast.emit('user:connection', nickname);
      users[nickname] = socket;
      callback(true);
    }
  });

  // Messages
  socket.on('say', function (message) {
    socket.get('nickname', function (err, nickname) {
      if (!err) {
        socket.broadcast.emit('msg:public', message, nickname);
      }
    });
  });
  socket.on('whisper', function (message, to) {
    socket.get('nickname', function (err, nickname) {
      if (!err) {
        if (users[to]) {
          users[to].emit('msg:private', message, nickname, to);
        }
      }
    });
  });

  // Command
  socket.on('command', function (command, callback) {
    switch (command) {
      case 'who':
        var nicknames = [];
        for(nickname in users) {
          nicknames.push(nickname);
        }
        callback(nicknames);
        break;
    }
  });

  // User disconnecting
  socket.on('disconnect', function () {
    socket.get('nickname', function (err, nickname) {
      if (!err && nickname) {
        delete users[nickname];
        socket.broadcast.emit('user:disconnection', nickname);
      }
    });
  });
});

