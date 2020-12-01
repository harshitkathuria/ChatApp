const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  username: String,
  text: String,
  time: String
})

const Msg = mongoose.model('Message', msgSchema);

module.exports = Msg;