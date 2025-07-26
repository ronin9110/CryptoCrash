const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);
