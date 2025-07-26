const mongoose = require('mongoose');
require('dotenv').config();

const Player = require('../models/Player');
const Wallet = require('../models/Wallet');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/CryptoCrash';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    await Player.deleteMany({});
    await Wallet.deleteMany({});

    const players = [];

    for (let i = 1; i <= 5; i++) {
      const player = new Player({ username: `player${i}` });
      await player.save();
      players.push(player);

      const btcWallet = new Wallet({
        playerId: player._id,
        currency: 'BTC',
        balance: 0.01
      });

      const ethWallet = new Wallet({
        playerId: player._id,
        currency: 'ETH',
        balance: 0.3
      });

      await btcWallet.save();
      await ethWallet.save();
    }

    console.log('✅ Seeded 5 players with BTC & ETH wallets.');
    players.forEach(p => console.log(`👤 ${p.username} - ID: ${p._id}`));

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed error:', err);
    mongoose.disconnect();
  }
};

seedData();
