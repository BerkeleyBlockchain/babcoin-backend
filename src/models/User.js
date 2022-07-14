const mongoose = require("mongoose");
const validator = require("validator");
const consts = require("../consts");

var Schema = mongoose.Schema;

const usersSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  address: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEthereumAddress(value)) {
        throw new Error("Address is invalid");
      }
    },
  },
  role: {
    type: String,
    required: true,
    validate(value) {
      if (!consts.roles.includes(value)) {
        throw new Error("Role is invalid");
      }
    },
  },
});

module.exports = mongoose.model("User", usersSchema);
