const mongoose = require("mongoose");

var sensorLogSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  }
});

var sensorLog = mongoose.model("sensorLog", sensorLogSchema);
module.exports = sensorLog;