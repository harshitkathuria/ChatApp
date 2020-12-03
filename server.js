const path = require('path');
const http = require('http');

require('dotenv').config({ path: './config.env'});

const mongoose = require('mongoose');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const Msg = require('./Model/messageModel');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord';

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);
const connect = mongoose.connect(DB, { useNewUrlParser: true , useUnifiedTopology: true });

// Run when a client connect
io.on('connection', socket => {
  console.log('in app')

  socket.on('joinRoom', async({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    // Connecting the websocket to a room
    socket.join(user.room);

    // Welcome current user 
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

    // Broadcast when a user connect
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} just joined the chat`));

    // Send users and room info
    io.to(user.room).emit('roomUsers', { 
      room: user.room,
      users: getRoomUsers(user.room)
    })

    // Retrieve messages from the database
    const messages = await Msg.find({ room: user.room}).limit(10);
    messages.forEach(el => {
      socket.emit('message', el);
    });
  })

  // Listen for chat message

  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    const formatMsg = formatMessage(user.username, msg);
    const id = socket.id;
    io.to(user.room).emit('message', formatMsg, id);

    // Save messages to DATABASE
    connect.then(async (db) => {
      // console.log('Conneected to DB');
      await Msg.create({ username: formatMsg.username, text: formatMsg.text, time: formatMsg.time, room: user.room});
    })
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
      // Send users and room info
      io.to(user.room).emit('roomUsers', { 
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }

  })
})

const port = 3000 || process.env.port;

server.listen(port, () => { console.log(`Server running on port ${port}`) })