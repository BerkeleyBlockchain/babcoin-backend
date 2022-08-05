const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const requirementSchema = new Schema({
  type: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("Requirement", requirementSchema);
