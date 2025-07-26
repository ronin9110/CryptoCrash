const express = require('express');
const router = express.Router();
const { getWallet } = require('../controllers/playerController');

router.get('/:playerId/wallet', getWallet);

module.exports = router;
