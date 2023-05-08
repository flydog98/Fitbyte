const mongoose = require("mongoose");

var userSelfPromiseSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  contents: {
    type: String,
    maxLength: 255,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

var userSelfPromise = mongoose.model("userSelfPromise", userSelfPromiseSchema);
module.exports = userSelfPromise;
