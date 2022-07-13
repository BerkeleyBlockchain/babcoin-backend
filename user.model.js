var mongoose = require('mongoose');
 
const connection = mongoose.createConnection('mongodb://localhost:27017/babcoin');
var Schema  = mongoose.Schema;

const userSchema = new Schema ({
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
  },
})

module.exports = connection.model('User', userSchema);