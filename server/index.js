const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const trainsRoutes = require('./routes/trains');
const sectionsRoutes = require('./routes/sections');
const optimizationRoutes = require('./routes/optimization');
const simulationRoutes = require('./routes/simulation');
const analyticsRoutes = require('./routes/analytics');
const alertsRoutes = require('./routes/alerts');

// Import services
const TrafficOptimizer = require('./services/TrafficOptimizer');
const RealTimeProcessor = require('./services/RealTimeProcessor');
const SimulationEngine = require('./services/SimulationEngine');
const AlertSystem = require('./services/AlertSystem');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Initialize services
const trafficOptimizer = new TrafficOptimizer();
const realTimeProcessor = new RealTimeProcessor();
const simulationEngine = new SimulationEngine();
const alertSystem = new AlertSystem();

// Store WebSocket connections
const wsConnections = new Set();

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');
  wsConnections.add(ws);
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Railway Control System',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    wsConnections.delete(ws);
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsConnections.delete(ws);
  });
});

// WebSocket message handler
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      ws.subscriptions = data.channels || [];
      break;
    case 'train_update':
      broadcastToSubscribers('train_updates', data.payload);
      break;
    case 'emergency_stop':
      handleEmergencyStop(data.payload);
      break;
    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
}

// Broadcast to WebSocket subscribers
function broadcastToSubscribers(channel, data) {
  const message = JSON.stringify({
    type: channel,
    data: data,
    timestamp: new Date().toISOString()
  });

  wsConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN && 
        ws.subscriptions && 
        ws.subscriptions.includes(channel)) {
      ws.send(message);
    }
  });
}

// Emergency stop handler
function handleEmergencyStop(payload) {
  console.log('Emergency stop triggered:', payload);
  broadcastToSubscribers('emergency', {
    type: 'emergency_stop',
    trainId: payload.trainId,
    reason: payload.reason,
    location: payload.location
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      optimizer: trafficOptimizer.isHealthy(),
      realTime: realTimeProcessor.isHealthy(),
      simulation: simulationEngine.isHealthy(),
      alerts: alertSystem.isHealthy()
    }
  });
});

// Real-time data simulation (for demo purposes)
function simulateRealTimeData() {
  const trains = [
    { id: '12002', name: 'Shatabdi Express', position: [Math.random() * 500 + 50, 220], speed: Math.random() * 3 + 1 },
    { id: '22470', name: 'Rajdhani Express', position: [Math.random() * 500 + 50, 194], speed: Math.random() * 3 + 1 },
    { id: '16032', name: 'Andaman Express', position: [Math.random() * 500 + 50, 173], speed: Math.random() * 3 + 1 }
  ];

  broadcastToSubscribers('train_positions', trains);
  
  // Simulate performance metrics
  const metrics = {
    punctualityRate: 85 + Math.random() * 10,
    throughputEfficiency: 90 + Math.random() * 8,
    averageDelay: 10 + Math.random() * 15,
    activeTrains: 24 + Math.floor(Math.random() * 6)
  };

  broadcastToSubscribers('performance_metrics', metrics);
}

// Schedule real-time data updates
cron.schedule('*/5 * * * * *', simulateRealTimeData); // Every 5 seconds

// AI optimization scheduler
cron.schedule('*/30 * * * * *', async () => {
  try {
    const optimization = await trafficOptimizer.optimize();
    broadcastToSubscribers('optimization_update', optimization);
  } catch (error) {
    console.error('Optimization error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚂 Railway Control Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for real-time connections`);
  console.log(`🤖 AI optimization engine initialized`);
});

module.exports = { app, server, wss };