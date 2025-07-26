require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const socketHandler = require('./websockets/socketHandler');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // your React client
    methods: ['GET', 'POST']
  }
});



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB error:', err));

// WebSocket setup
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
