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
  date: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  achieved: {
    type: Boolean,
    default: false,
  },
});

var userTimePromise = mongoose.model('userTimePromise', userTimePromiseSchema);
module.exports = userTimePromise;