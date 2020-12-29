const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const encKey = process.env.ENCRYPT_ENC_KEY;
const sigKey = process.env.ENCRYPT_SIGN_KEY;

const msgSchema = new mongoose.Schema({
  username: { 
    type: String,
    required: true
  },
  text: { 
    type: String,
    required: true
  },
  time: { 
    type: String,
    required: true
  },
  room: { 
    type: String,
    required: true
  }
})

// Encrypting messages
msgSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['text'] });

const Msg = mongoose.model('Message', msgSchema);

module.exports = Msg;