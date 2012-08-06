var socket = io.connect(window.location.origin);
var nickname;
var quitRegExp = /^\/quit/;
var whoRegExp = /^\/who/;
var helpRegExp = /^\/help/;
var atNickAndMessageRegExp = /^@([^\s]+)\s(.+)$/;

$(function () {
  $('#login form').on('submit', function (event) {
    nickname = $('#nickname-input').val();
    event.preventDefault();
    $('#nickname-input').val('');
    if (nickname) {
      socket.emit('nickname', nickname, function (isAvailable) {
        if (isAvailable) {
          $('body').removeClass('login').addClass('chat');
          help();
          addMessage('Connected as ' + nickname, 'info');
          whoIsConnected();
        }
      });
    }
  });

  $('#chat form').on('submit', function (event) {
    var message = $('#chat-input').val();
    var match;
    event.preventDefault();
    $('#chat-input').val('');
    if (quitRegExp.test(message)) {
      window.location.reload();
    } else if (whoRegExp.test(message)) {
      whoIsConnected();
    } else if (helpRegExp.test(message)) {
      help();
    } else if (atNickAndMessageRegExp.test(message)) {
      match = message.match(atNickAndMessageRegExp);
      socket.emit('whisper', match[2], match[1], function (receiverIsConnected) {
        if (receiverIsConnected) {
          addMessage(nickname + '@' + nicknameMarkup(match[1]) + ': ' + match[2], 'msg private');
        } else {
          addMessage(match[1] + ' not connected :(', 'info');
        }
      });
    } else {
      socket.emit('say', message);
      addMessageFrom(message, 'msg me', nickname);
    }
  });
});

function addMessage(message, type) {
  $('#chat-content').append($('<li>').addClass(type).html(message));
  goToBottom();
}

function addMessageFrom(message, type, from) {
  addMessage(nicknameMarkup(from) + ': ' + message, type);
}

function nicknameMarkup(nickname) {
  return '<span class="nickname">' + nickname + '</span>';
}

function goToBottom() {
  var $chatContent = $('#chat-content');
  var chatContent = $chatContent[0];
  $('#chat-content').animate({
    scrollTop: chatContent.scrollHeight - chatContent.clientHeight
  }, 300);
}

function whoIsConnected() {
  socket.emit('command', 'who', function (who) {
    var otherUsers = (who || []).filter(function (user) {return user !== nickname; });
    var message;
    if (otherUsers.length === 0) {
      addMessage('No other user connected', 'info');
    } else {
      message = otherUsers.length > 1 ? 'Users' : 'User';
      addMessage('Other ' + message + ' connected : ' + otherUsers.map(function (user) {
        return nicknameMarkup(user);
      }).join(', '), 'info');
    }
  });
}

function help() {
  addMessage('With <3, source : <a href="https://github.com/ymainier/talktome.git">talktome.git</a>', 'info');
  addMessage('Type "@nickname message" to send a private message to nickname', 'info');
  addMessage('Type "/who" for a list of connected user', 'info');
  addMessage('Type "/quit" to disconnect', 'info');
  addMessage('Type "/help" for this message', 'info');
}

socket.on('user:connection', function (nickname) {
  addMessage(nicknameMarkup(nickname) + ' connected', 'info');
});

socket.on('user:disconnection', function (nickname) {
  if (nickname) {
    addMessage(nicknameMarkup(nickname) + ' disconnected', 'info');
  }
});

socket.on('msg:public', function (message, from) {
  addMessageFrom(message, 'msg public', from);
});
socket.on('msg:private', function (message, from, to) {
  addMessageFrom(message, 'msg private', from);
});

socket.on('disconnect', function () {
  window.location.reload();
});
