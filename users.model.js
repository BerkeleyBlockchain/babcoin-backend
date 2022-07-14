var mongoose = require('mongoose');
const consts = require('./consts');

const connection = mongoose.createConnection(consts.uri);
var Schema  = mongoose.Schema;

const usersSchema = new Schema ({
  _id: Number,
  first_name: {
    type: String,
    required: true
  },
  last_name: { 
    type: String, 
    require: true
  },
  email: { 
    type: String, 
    require: true
  },
  wallet_address: { 
    type: String, 
    require: true
  },
  last_name: { 
    type: String, 
    require: true
  }
});

module.exports = connection.model('Users', usersSchema, 'users');