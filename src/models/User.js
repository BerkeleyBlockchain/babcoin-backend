const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const usersSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  wallet_address: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: true,
  },
});

module.exports = connection.model("Users", usersSchema, "users");
