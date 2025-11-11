require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

// Import config
const connectDB = require('./config/database');
const logger = require('./config/logger');
require('./config/passport');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

/**
 * Initialize Express App
 */
const app = express();

/**
 * Connect to Database
 */
connectDB();

/**
 * Security Middlewares
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_MOBILE,
    'http://localhost:3000',
    'http://localhost:19000',
    'exp://localhost:19000',
  ],
  credentials: true,
}));

app.use(mongoSanitize()); // Prevent NoSQL injection

/**
 * Body Parser Middlewares
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression Middleware
 */
app.use(compression());

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

/**
 * Passport Middleware
 */
app.use(passport.initialize());

/**
 * Create uploads directories if they don't exist
 */
const uploadsDirTemp = path.join(__dirname, '../uploads/temp');
const uploadsDirVideos = path.join(__dirname, '../uploads/videos');
const uploadsDirThumbnails = path.join(__dirname, '../uploads/thumbnails');
const uploadsDirAvatars = path.join(__dirname, '../uploads/avatars');

[uploadsDirTemp, uploadsDirVideos, uploadsDirThumbnails, uploadsDirAvatars].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Serve uploaded files statically (for local development without AWS S3)
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * API Routes
 */
const API_VERSION = process.env.API_VERSION || 'v1';

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dorphin API is running',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Apply rate limiting to all API routes
app.use(`/api/${API_VERSION}`, apiLimiter);

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/videos`, videoRoutes);
app.use(`/api/${API_VERSION}/comments`, commentRoutes);
app.use(`/api/${API_VERSION}/reactions`, reactionRoutes);
app.use(`/api/${API_VERSION}/follow`, followRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Create HTTP Server
 */
const server = http.createServer(app);

/**
 * Socket.IO for Real-time Notifications
 */
const io = socketIO(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      process.env.CLIENT_URL_MOBILE,
      'http://localhost:3000',
      'http://localhost:19000',
    ],
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`✅ Socket connected: ${socket.id}`);

  // Join user room for personal notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their notification room`);
  });

  // Leave room
  socket.on('leave', (userId) => {
    socket.leave(`user_${userId}`);
    logger.info(`User ${userId} left their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to our router
app.set('io', io);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🐬 DORPHIN API SERVER                                    ║
  ║                                                            ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                                    ║
  ║   Port: ${PORT}                                              ║
  ║   API Version: ${API_VERSION}                                        ║
  ║                                                            ║
  ║   📡 Server running at http://localhost:${PORT}             ║
  ║   📚 API Docs: http://localhost:${PORT}/api/${API_VERSION}           ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = { app, io };
