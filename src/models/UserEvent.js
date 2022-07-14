const mongoose = require("mongoose");

const connection = mongoose.createConnection(consts.uri);
var Schema = mongoose.Schema;

const usereventsSchema = new Schema({
  _id: Number,
  event_id: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Number,
    require: true,
  },
});

module.exports = connection.model("Userevents", usereventsSchema, "userevents");
