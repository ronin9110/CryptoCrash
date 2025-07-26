const { startNewRound, endRound, getCurrentRound } = require('../services/gameService');
const Bet = require('../models/Bet');
const { getPrices } = require('../services/priceService');
const { updateWallet } = require('../services/walletService');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

module.exports = function(io) {
  console.log('WebSocket server initialized');

  let multiplier = 1.0;
  let roundInterval = null;

  // Broadcast multiplier every 100ms
  async function runGameRound() {
    const round = await startNewRound();
    const roundId = round.roundId;
    const startTime = Date.now();
    const crashMultiplier = round.crashPoint;

    multiplier = 1.0;

    io.emit('round_start', { roundId, crashMultiplier });

    roundInterval = setInterval(async () => {
      const elapsed = (Date.now() - startTime) / 1000;
      multiplier = 1 + elapsed * 0.1; // exponential growth

      if (multiplier >= crashMultiplier) {
        clearInterval(roundInterval);
        await endRound();
        io.emit('crash', { crashPoint: crashMultiplier.toFixed(2) });
      } else {
        io.emit('multiplier', { multiplier: multiplier.toFixed(2) });
      }
    }, 100);
  }

  // Repeat every 10 seconds
  setInterval(runGameRound, 10000);

  // Handle player WebSocket connections
  io.on('connection', socket => {
    console.log(`🟢 [${new Date().toLocaleTimeString()}] Socket: ${socket.id}`);

    socket.on('cashout', async ({ playerId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(playerId)) {
      socket.emit('error', { error: 'Invalid player ID format' });
      return;
    }
        const round = getCurrentRound();
        if (!round || !round.isActive) return;

        const bet = await Bet.findOne({ playerId, roundId: round.roundId });
        if (!bet || bet.cashedOut) return;

        const prices = await getPrices();
        const price = prices[bet.currency];
        const payoutCrypto = bet.cryptoAmount * multiplier;
        const usdPayout = payoutCrypto * price;

        // Update wallet & transaction
        await updateWallet(playerId, bet.currency, payoutCrypto, 'cashout', usdPayout, price);

        bet.cashedOut = true;
        bet.cashoutMultiplier = multiplier;
        bet.cashoutAt = new Date();
        await bet.save();

        io.emit('player_cashout', {
          playerId,
          multiplier: multiplier.toFixed(2),
          payoutCrypto: payoutCrypto.toFixed(8),
          usdPayout: usdPayout.toFixed(2)
        });

      } catch (err) {
        console.error('WebSocket cashout error:', err.message);
    socket.emit('error', { error: 'Cashout failed' });

      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Disconnected: ${socket.id} (${reason})`);
    });
  });
};
