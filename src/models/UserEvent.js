const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const userEventsSchema = new Schema({
  eventId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("UserEvent", userEventsSchema);
