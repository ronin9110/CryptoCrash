const { getPlayerWallet } = require('../services/walletService');

const getWallet = async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const wallet = await getPlayerWallet(playerId);
    res.json(wallet);
  } catch (err) {
    console.error('Wallet fetch error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getWallet };
