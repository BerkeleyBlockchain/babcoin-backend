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
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validate(value) {
      if (!consts.eventTypes.includes(value)) {
        throw new Error("Event type is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  nftArtUrl: {
    type: String,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Image URL is invalid");
      }
    },
  },
  imageUrl: {
    type: String,
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("Image URL is invalid");
      }
    },
  },
  qrCodeSrc: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
  },
  nftId: {
    type: Number,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  isMinted: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Event", eventsSchema);
