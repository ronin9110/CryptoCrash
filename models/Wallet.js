const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  currency: { type: String, enum: ['BTC', 'ETH'], required: true },
  balance: { type: Number, default: 0 } // in BTC or ETH
});

module.exports = mongoose.model('Wallet', walletSchema);
