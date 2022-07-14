const mongoose = require("mongoose");
const consts = require("../consts");
const validator = require("validator");

const Schema = mongoose.Schema;

const eventsSchema = new Schema({
  startTimestamp: {
    type: Number,
    required: true,
  },
  endTimestamp: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
    validate(value) {
      if (!consts.eventTypes.includes(value)) {
        throw new Error("Event type is invalid");
      }
    },
  },
  password: {
    type: String,
    require: true,
  },
  imageUrl: {
    type: String,
    require: true,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Image URL is invalid");
      }
    },
  },
  qrCodeUrl: {
    type: String,
    require: true,
  },
  weight: {
    type: Number,
    require: true,
    default: 1,
  },
  nftId: {
    type: Number,
    require: true,
    unique: true,
  },
});

module.exports = mongoose.model("Event", eventsSchema);
