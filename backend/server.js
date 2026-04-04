const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Pass io to routes/services if needed
app.set('socketio', io);

// Routes
const authRoutes = require('./routes/authRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/trigger', simulationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

console.log("Attempting to connect to MongoDB Atlas...");
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/gigshield";

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`✅ MongoDB Connected Successfully.`);
  })
  .catch(err => {
    console.warn("⚠️  MongoDB connection failed. Running in DEMO mode (in-memory data).");
    console.warn(err.message);
  })
  .finally(() => {
    server.listen(PORT, () => console.log(`🚀 GigShield Backend running on port ${PORT} (Demo Mode Active)`));
  });
