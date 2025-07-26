const Bet = require('../models/Bet');
const { getPrices } = require('../services/priceService');
const { usdToCrypto } = require('../utils/convert');
const { getCurrentRound } = require('../services/gameService');
const { updateWallet } = require('../services/walletService');
const mongoose = require('mongoose');

const placeBet = async (req, res) => {
  try {

    const { playerId, usdAmount, currency } = req.body;
    if (!playerId || !usdAmount || !currency) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
  return res.status(400).json({ error: 'Invalid player ID format' });
}
    const round = getCurrentRound();
    if (!round || !round.isActive) {
      return res.status(400).json({ error: 'No active round' });
    }

    const prices = await getPrices();
    const price = prices[currency];
    const cryptoAmount = usdToCrypto(usdAmount, price);

    // Update wallet (deduct crypto)
    await updateWallet(playerId, currency, -cryptoAmount, 'bet', usdAmount, price);

    // Save bet
    const bet = new Bet({
      playerId,
      roundId: round.roundId,
      usdAmount,
      cryptoAmount,
      currency
    });

    await bet.save();
    res.json({ success: true, bet });

  } catch (err) {
    console.error('Bet error:', err.message);
    res.status(500).json({ error: 'Internal error placing bet' });
  }
};

const cashOut = async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'Missing player ID' });
    if (!mongoose.Types.ObjectId.isValid(playerId)) {
  return res.status(400).json({ error: 'Invalid player ID format' });
}
    const round = getCurrentRound();
    if (!round || !round.isActive) {
      return res.status(400).json({ error: 'No active round' });
    }

    const bet = await findOne({ playerId, roundId: round.roundId });
    if (!bet || bet.cashedOut) {
      return res.status(400).json({ error: 'No valid bet found or already cashed out' });
    }

    const prices = await getPrices();
    const price = prices[bet.currency];

    // Assume currentMultiplier is sent by frontend (should come via WebSocket ideally)
    const currentMultiplier = req.body.multiplier;
    const payoutCrypto = bet.cryptoAmount * currentMultiplier;
    const usdPayout = payoutCrypto * price;

    // Update wallet
    await updateWallet(playerId, bet.currency, payoutCrypto, 'cashout', usdPayout, price);

    // Update bet
    bet.cashedOut = true;
    bet.cashoutMultiplier = currentMultiplier;
    bet.cashoutAt = new Date();
    await bet.save();

    res.json({
      success: true,
      payoutCrypto: payoutCrypto.toFixed(8),
      usdPayout: usdPayout.toFixed(2)
    });

  } catch (err) {
    console.error('Cashout error:', err.message);
    res.status(500).json({ error: 'Internal error during cashout' });
  }
};

module.exports = { placeBet, cashOut };