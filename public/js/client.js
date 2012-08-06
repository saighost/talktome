var socket = io.connect(window.location.origin);
var nickname;

$(function () {
  $('#login form').on('submit', function (event) {
    nickname = $('#nickname-input').val();
    event.preventDefault();
    $('#nickname-input').val('');
    if (nickname) {
      socket.emit('nickname', nickname, function (isAvailable) {
        if (isAvailable) {
          $('body').removeClass('login').addClass('chat');
          $('#chat-content').html($('<li>').addClass("info").text('Connected as ' + nickname));
        }
      });
    }
  });

  $('#chat form').on('submit', function (event) {
    var message = $('#chat-input').val();
    event.preventDefault();
    $('#chat-input').val('');
    if (/^\/quit/.test(message)) {
      window.location.reload();
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
