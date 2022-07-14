var mongoose = require('mongoose');
const consts = require('./consts');

const connection = mongoose.createConnection(consts.uri);
var Schema  = mongoose.Schema;

const eventsSchema = new Schema ({
  _id: Number,
  start_timestamp: {
    type: Number,
    required: true
  },
  end_timestamp: { 
    type: Number, 
    require: true
  },
  name: { 
    type: String, 
    require: true
  },
  type: { 
    type: String, 
    require: true
  },
  password: { 
    type: String, 
    require: true
  },
  image_url: { 
    type: String, 
    require: true
  },
  qrcode_url: { 
    type: String, 
    require: true
  }
});

module.exports = connection.model('Events', eventsSchema, 'events');
