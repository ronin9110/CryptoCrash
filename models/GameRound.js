const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundId: { type: String, required: true },
  startTime: { type: Date, required: true },
  crashPoint: { type: Number, required: true },
  seed: { type: String, required: true },
  hash: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('GameRound', gameRoundSchema);
