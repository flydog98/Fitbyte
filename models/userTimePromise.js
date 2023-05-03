const mongoose = require('mongoose');

var userTimePromiseSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
});

var userTimePromise = mongoose.model('userTimePromise', userTimePromiseSchema);
module.exports = userTimePromise;