const crypto = require('crypto');

const MAX_CRASH = 100;

function generateSeed() {
  return crypto.randomBytes(16).toString('hex');
}

function getHash(seed, roundId) {
  return crypto.createHash('sha256').update(seed + roundId).digest('hex');
}

function getCrashPoint(hash) {
  const h = BigInt('0x' + hash);
  const e = h % 10000n;
  const result = 1.0 + Number(e) / 1000.0;
  return Math.min(result, MAX_CRASH);
}

module.exports = {
  generateSeed,
  getHash,
  getCrashPoint
};
