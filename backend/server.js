const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Initialize SQLite database
const { initializeDatabase } = require('./database/sqlite');

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

// Initialize Real-Time Services
const RealTimeWeatherService = require('./services/RealTimeWeatherService');
const RealTimeTrafficService = require('./services/RealTimeTrafficService');
const RealTimePayoutEngine = require('./services/RealTimePayoutEngine');
const AIInsuranceAgent = require('./services/AIInsuranceAgent');
const DeliveryImpactPredictor = require('./services/DeliveryImpactPredictor');
const EarningsOptimizationEngine = require('./services/EarningsOptimizationEngine');

const weatherService = new RealTimeWeatherService(io);
const trafficService = new RealTimeTrafficService(io);
const payoutEngine = new RealTimePayoutEngine(io, weatherService, trafficService);
const aiAgent = new AIInsuranceAgent(weatherService, trafficService);
const impactPredictor = new DeliveryImpactPredictor(weatherService, trafficService, io);
const earningsOptimizer = new EarningsOptimizationEngine(weatherService, trafficService, io);

// Make services available to routes
app.set('socketio', io);
app.set('weatherService', weatherService);
app.set('trafficService', trafficService);
app.set('payoutEngine', payoutEngine);
app.set('aiAgent', aiAgent);
app.set('impactPredictor', impactPredictor);
app.set('earningsOptimizer', earningsOptimizer);

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their personal room`);
  });

  socket.on('start_monitoring', async (data) => {
    const { workerId, lat, lon } = data;
    console.log(`🔍 Starting real-time monitoring for worker ${workerId}`);
    await payoutEngine.startWorkerMonitoring(workerId, lat, lon);
    
    // Also start impact prediction monitoring
    impactPredictor.startMonitoring(workerId, lat, lon);
  });

  socket.on('stop_monitoring', (data) => {
    const { workerId } = data;
    console.log(`⏹️ Stopping monitoring for worker ${workerId}`);
    payoutEngine.stopWorkerMonitoring(workerId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const authRoutesNew = require('./routes/authRoutesNew'); // New secure auth
const simulationRoutes = require('./routes/simulationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const realtimeRoutes = require('./routes/realtimeRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const optimizationRoutes = require('./routes/optimizationRoutes');

app.use('/api/auth', authRoutes); // Old OTP-based auth (keep for backward compatibility)
app.use('/api/v2/auth', authRoutesNew); // New secure login/signup
app.use('/api/trigger', simulationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/optimization', optimizationRoutes);

// Initialize SQLite database
try {
  initializeDatabase();
  console.log('✅ SQLite Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 EarnSure Backend running on port ${PORT}`);
  console.log(`📊 Database: SQLite (earnsure.db)`);
  console.log(`🤖 AI Chatbot: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`📱 SMS: ${process.env.TWILIO_ACCOUNT_SID ? 'Real' : 'Mock'} Mode`);
});
