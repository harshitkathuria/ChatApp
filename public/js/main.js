const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('msg');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from the URL
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const socket = io();

// Join chat room
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
})

// Message from server
socket.on('message', (message, id = null) => {

  if(id && socket.id == id) {
    outputMessage(message, true);
  }
  else {
    outputMessage(message);
  }

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

// `User is Typing` feature
let typing = false;
let timeout = undefined;

function typingTimeout(){
  typing = false;
  socket.emit('not-typing', '');
}

function onKeyDown(){
  if(typing === false) {
    typing = true
    socket.emit('typing', '');
    timeout = setTimeout(typingTimeout, 2000);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(typingTimeout, 2000);
  }
}

chatInput.addEventListener('keypress', e => {
  if(e.key !== 'Enter') {
    onKeyDown();
  }
  else {
    typingTimeout();
    clearTimeout(timeout);
  }
})

socket.on('user-typing', msg => {
  const div = document.createElement('div');
  div.id = 'user-typing';
  div.innerText = msg;
  chatMessages.appendChild(div);
})

socket.on('user-not-typing', msg => {
  document.getElementById('user-typing').remove();
})

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Getting the message text
  const msg = e.target.elements.msg.value;
  
  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear Input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
})

// Output message to DOM
function outputMessage(message, right = false) {
  const div = document.createElement('div');
  div.classList.add('message');
  if(right) {
    div.style.textAlign = 'right';
    message.username = 'You';
  }

  div.innerHTML = 
  `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerHTML = room;
}

// Add users to DOM
function outputRoomUsers(users) {
  // console.log(users);
  userList.innerHTML = `${users.map(user => `<li class="collection-item"  style="background-color: #7345c2">${user.username}</li>`).join('')}`;
}