const GameRound = require('../models/GameRound');
const { generateSeed, getHash, getCrashPoint } = require('../utils/fairCrash');
const { v4: uuidv4 } = require('uuid');

let currentRound = null;

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
