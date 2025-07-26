const GameRound = require('../models/GameRound');
const { generateSeed, getHash, getCrashPoint } = require('../utils/fairCrash');
const { v4: uuidv4 } = require('uuid');

let currentRound = null;

const { updateWallet } = require('../services/walletService');

async function handleCashout(socket, playerId, multiplier, currency, betAmount, price) {
  const cryptoPayout = betAmount * multiplier / price; // e.g., $20 * 2x / 60000 = 0.000666 BTC

  const updatedWallet = await updateWallet(
    playerId,
    currency,
    cryptoPayout,
    'cashout',
    betAmount * multiplier,
    price
  );

  socket.emit("cashoutSuccess", {
    playerId,
    newBalanceCrypto: updatedWallet.balance,
    newBalanceUSD: (updatedWallet.balance * price).toFixed(2),
  });
}


async function startNewRound() {
  const roundId = uuidv4();
  const seed = generateSeed();
  const hash = getHash(seed, roundId);
  const crashPoint = getCrashPoint(hash);

  const round = new GameRound({
    roundId,
    startTime: new Date(),
    crashPoint,
    seed,
    hash,
    isActive: true
  });

  await round.save();
  currentRound = round;
  return round;
}

async function endRound() {
  if (!currentRound) return;

  const roundCopy = await GameRound.findOne({ roundId: currentRound.roundId });

  if (!roundCopy) return;

  roundCopy.isActive = false;
  await roundCopy.save();

  currentRound = null;
}


function getCurrentRound() {
  return currentRound;
}

module.exports = {
  startNewRound,
  endRound,
  getCurrentRound
};
