const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

async function getPlayerWallet(playerId) {
  const wallets = await Wallet.find({ playerId });
  const prices = require('./priceService').getPrices;
  const priceMap = await prices();

  return wallets.map(wallet => ({
    currency: wallet.currency,
    balance: wallet.balance,
    usd: (wallet.balance * priceMap[wallet.currency]).toFixed(2)
  }));
}

async function updateWallet(playerId, currency, cryptoDelta, transactionType, usdAmount, price) {
  const wallet = await Wallet.findOneAndUpdate(
    { playerId, currency },
    { $inc: { balance: cryptoDelta } },
    { upsert: true, new: true }
  );

  const transaction = new Transaction({
    playerId,
    usdAmount,
    cryptoAmount: cryptoDelta,
    currency,
    transactionType,
    transactionHash: uuidv4(),
    priceAtTime: price
  });

  await transaction.save();
  return wallet;
}

module.exports = {
  getPlayerWallet,
  updateWallet
};
