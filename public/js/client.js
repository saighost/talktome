var socket = io.connect(window.location.origin);
var nickname;
var quitRegExp = /^\/quit/;
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

function addUser(username) {
  $('#user-list').append($('<li>').addClass('nickname').html(username));
  goToBottom();
}

function removeUser(username) {
  $('li.nickname').each(function (argument) {
    if($(this).text()===username){
      $(this).remove();
      return false;
    };
  })
  $('#'+username).remove();
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
    $('#user-list').children().next().remove();
    var users = $(who ||[]);
    var message;
    users.each(function (i,user) {
        addUser(user);
    });
  });
}

function help() {
  addMessage('Type "@nickname message" to send a private message to nickname', 'info');
  addMessage('Type "/quit" to disconnect', 'info');
  addMessage('Type "/help" for this message', 'info');
}

socket.on('user:connection', function (nickname) {
  addUser(nickname);
  addMessage(nicknameMarkup(nickname) + ' connected', 'info');
});

socket.on('user:disconnection', function (nickname) {
  if (nickname) {
    removeUser(nickname);
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
