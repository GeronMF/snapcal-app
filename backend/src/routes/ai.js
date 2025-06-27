const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth-mysql');
const aiService = require('../services/aiAnalysisService');

const router = express.Router();

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
router.post('/analyze', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const { comment = '', language } = req.body;
    
    // Get user language from request, user profile, or default to English
    const userLanguage = language || req.user?.language || 'en';
    
    console.log(`🔍 AI Analysis request: language=${userLanguage}, comment="${comment}"`);

    // Analyze the image using AI service
    const analysis = await aiService.analyzeImage(req.file.buffer, comment, userLanguage);

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
    console.error('AI Analysis route error:', error);
    next(error);
  }
});

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