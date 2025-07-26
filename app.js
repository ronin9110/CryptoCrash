const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const playerRoutes = require('./routes/playerRoutes');
const gameRoutes = require('./routes/gameRoutes');

app.use('/api/players', playerRoutes);
app.use('/api/game', gameRoutes);

app.get('/', (req, res) => res.send('Crypto Crash Game Backend Running'));

module.exports = app;
