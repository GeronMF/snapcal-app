const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
console.log('DB_NAME:', process.env.DB_NAME);

const authRoutes = require('./routes/auth-mysql');
const userRoutes = require('./routes/users-mysql');
const mealRoutes = require('./routes/meals-mysql');
const aiRoutes = require('./routes/ai');
const adminAiRoutes = require('./routes/admin-ai');
const { errorHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Import AI services
const aiProviderManager = require('./services/aiProviders/AIProviderManager');
const AISettingsService = require('./services/AISettingsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Initialize AI Provider Manager
async function initializeAI() {
  try {
    console.log('🤖 Initializing AI Provider Manager...');
    
    const aiSettings = new AISettingsService();
    
    // Get AI configuration from database
    const config = await aiSettings.getAIManagerConfig();
    
    // Initialize AI Manager with config
    await aiProviderManager.initialize(config);
    
    console.log('✅ AI Provider Manager initialized successfully');
    
    // Отключаем прогрев - может вызывать проблемы с первыми запросами
    // setTimeout(warmupAIProviders, 5000);
    
  } catch (error) {
    console.error('❌ Failed to initialize AI Provider Manager:', error);
    // Don't crash the server, just log the error
  }
}

async function warmupAIProviders() {
  try {
    console.log('🔥 Warming up AI providers...');
    
    // Создаем тестовое изображение (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x99, 0xE6, 0x8C, 0x88, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    
    const warmupStart = Date.now();
    await aiProviderManager.analyzeImage(testImageBuffer, 'en', 'warmup test');
    const warmupTime = Date.now() - warmupStart;
    
    console.log(`🔥 AI providers warmed up in ${warmupTime}ms`);
  } catch (error) {
    console.log(`⚠️ AI warmup failed: ${error.message} (this is expected for warmup)`);
  }
}

// Initialize AI after a short delay to ensure DB is ready
setTimeout(initializeAI, 2000);

// Trust proxy for production (behind nginx)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://snapcal.fun', 'https://www.snapcal.fun']
    : ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Serve web app static files with proper MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/ai', adminAiRoutes);

// Terms page route
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/terms.html'));
});

// Demo page route
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/demo.html'));
});

// AI Admin panel JavaScript file with proper headers
app.get('/admin-ai.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../public/admin-ai.js'));
});

// AI Admin panel route (disable CSP for admin panel)
app.get('/admin/ai', (req, res) => {
  // Отключаем CSP для админ-панели
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  
  // Устанавливаем менее строгие заголовки безопасности для админ-панели
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  res.sendFile(path.join(__dirname, '../public/admin-ai.html'));
});

// Serve web app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Если запрос не к API, отдаем index.html
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Устанавливаем разумные таймауты сервера для AI запросов
server.timeout = 30000; // 30 секунд общий таймаут сервера
server.keepAliveTimeout = 25000; // 25 секунд keep-alive
server.headersTimeout = 26000; // 26 секунд headers timeout

console.log('⏰ Server timeouts configured: 30s timeout, 25s keep-alive');

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    
    // Shutdown AI Provider Manager
    aiProviderManager.shutdown();
    
    // Close database connections
    const { pool } = require('./config/database');
    if (pool) {
      pool.end();
      console.log('Database pool closed');
    }
    process.exit(0);
  });
});

module.exports = app; 