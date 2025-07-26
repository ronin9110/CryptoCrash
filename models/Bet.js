const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  roundId: {
    type: String,
    required: true
  },
  usdAmount: {
    type: Number,
    required: true
  },
  cryptoAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['BTC', 'ETH'],
    required: true
  },
  cashedOut: {
    type: Boolean,
    default: false
  },
  cashoutMultiplier: {
    type: Number
  },
  cashoutAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bet', betSchema);
