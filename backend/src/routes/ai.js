const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth-mysql');
const { requestLogger, aiRequestLogger } = require('../middleware/requestLogger');
const aiService = require('../services/aiAnalysisService');

const router = express.Router();

// Middleware для установки таймаута на AI запросы
const setAITimeout = (req, res, next) => {
  // Убираем таймаут на уровне запроса - пусть обрабатывается на уровне OpenAI
  console.log('🔍 AI request started at:', new Date().toISOString());
  next();
};

// Configure multer for AI analysis
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// AI analysis function is now handled by aiService

// @desc    Analyze food image
// @route   POST /api/ai/analyze
// @access  Private
router.post('/analyze', protect, requestLogger, aiRequestLogger, setAITimeout, upload.single('image'),
  async (req, res, next) => {
    // Используем requestId из middleware
    const requestId = req.requestId || Math.random().toString(36).substring(7);
    const startTime = req.startTime || Date.now();
    
    try {
      console.log(`🔍 [${requestId}] AI Analysis processing started`);
      
      if (!req.file) {
        console.error(`❌ [${requestId}] No image file provided`);
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      const { comment = '', language } = req.body;

      // Get user language from request, user profile, or default to English
      const userLanguage = language || req.user?.language || 'en';

      console.log(`🔍 [${requestId}] AI Analysis request: language=${userLanguage}, comment="${comment}"`);
      console.log(`📄 [${requestId}] File size: ${req.file.buffer.length} bytes`);
      console.log(`👤 [${requestId}] User ID: ${req.user?.id || 'unknown'}`);

      // Analyze the image using AI service
      const analysisStartTime = Date.now();
      const analysis = await aiService.analyzeImage(req.file.buffer, comment, userLanguage);
      const analysisEndTime = Date.now();
      console.log(`⏱️ [${requestId}] Total analysis time: ${analysisEndTime - analysisStartTime}ms`);

      const totalTime = Date.now() - startTime;
      console.log(`✅ [${requestId}] AI Analysis route completed successfully in ${totalTime}ms`);

      res.json({
        success: true,
        data: {
          name: analysis.name,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          confidence: analysis.confidence,
          portions: analysis.portions,
          comment: comment,
          language: analysis.language,
          provider: analysis.provider,
          regional: analysis.regional || false,
          timestamp: analysis.timestamp
        }
      });
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [${requestId}] AI Analysis route error after ${totalTime}ms:`, error.message);
      console.error(`🔍 [${requestId}] Error stack:`, error.stack?.split('\n').slice(0, 3).join('\n'));

      // Обработка таймаут ошибок
      if (error.message && error.message.includes('timeout')) {
        console.error(`⏰ [${requestId}] Timeout error detected`);
        return res.status(408).json({
          success: false,
          error: 'AI анализ занимает слишком много времени. Попробуйте позже.',
          code: 'TIMEOUT'
        });
      }

      // Обработка ошибок сети
      if (error.message && (error.message.includes('Network') || error.message.includes('connection'))) {
        console.error(`🌐 [${requestId}] Network error detected`);
        return res.status(503).json({
          success: false,
          error: 'Проблема с соединением к AI сервису. Попробуйте позже.',
          code: 'NETWORK_ERROR'
        });
      }

      // Обработка ошибок OpenAI API
      if (error.status) {
        console.error(`🔴 [${requestId}] OpenAI API error: ${error.status}`);
        return res.status(503).json({
          success: false,
          error: 'Временная проблема с AI сервисом. Попробуйте позже.',
          code: 'AI_SERVICE_ERROR'
        });
      }

      next(error);
    }
  }
);

// @desc    Get AI service status
// @route   GET /api/ai/status
// @access  Private
router.get('/status', protect, async (req, res, next) => {
  try {
    const status = await aiService.getStatus();

    res.json({
      success: true,
      data: {
        ...status,
        version: '2.0.0',
        features: [
          'food-recognition',
          'calorie-estimation',
          'nutrition-analysis',
          'multilingual-support',
          'comment-processing',
          'regional-foods'
        ]
      }
    });
  } catch (error) {
    console.error('AI Status route error:', error);
    next(error);
  }
});

module.exports = router; 