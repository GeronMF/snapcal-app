const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

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

// Mock AI analysis - replace with real AI service
const analyzeFoodImage = async (imageBuffer, comment = '') => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock food database
  const mockFoods = [
    { name: 'Pizza Margherita', calories: 285, protein: 12, carbs: 35, fat: 10 },
    { name: 'Caesar Salad', calories: 150, protein: 8, carbs: 12, fat: 8 },
    { name: 'Cheeseburger', calories: 520, protein: 25, carbs: 35, fat: 28 },
    { name: 'Pasta Carbonara', calories: 380, protein: 15, carbs: 45, fat: 18 },
    { name: 'Chicken Sandwich', calories: 270, protein: 22, carbs: 25, fat: 12 },
    { name: 'Sushi Roll', calories: 190, protein: 8, carbs: 35, fat: 2 },
    { name: 'Grilled Salmon', calories: 420, protein: 35, carbs: 5, fat: 25 },
    { name: 'Vegetable Soup', calories: 120, protein: 5, carbs: 18, fat: 4 },
    { name: 'Chocolate Cake', calories: 370, protein: 6, carbs: 45, fat: 18 },
    { name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 8, fat: 5 },
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 3 },
    { name: 'Scrambled Eggs', calories: 180, protein: 12, carbs: 2, fat: 14 },
    { name: 'Rice Bowl', calories: 220, protein: 4, carbs: 45, fat: 0.5 }
  ];

  // Random selection based on comment or image analysis
  let selectedFood;
  if (comment) {
    // Try to match comment with food names
    const commentLower = comment.toLowerCase();
    selectedFood = mockFoods.find(food => 
      food.name.toLowerCase().includes(commentLower) ||
      commentLower.includes(food.name.toLowerCase())
    );
  }

  // If no match found or no comment, select random food
  if (!selectedFood) {
    selectedFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
  }

  // Add some variation to calories (±10%)
  const variation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  const adjustedCalories = Math.round(selectedFood.calories * variation);
  const adjustedProtein = Math.round(selectedFood.protein * variation * 10) / 10;
  const adjustedCarbs = Math.round(selectedFood.carbs * variation * 10) / 10;
  const adjustedFat = Math.round(selectedFood.fat * variation * 10) / 10;

  return {
    name: selectedFood.name,
    calories: adjustedCalories,
    protein: adjustedProtein,
    carbs: adjustedCarbs,
    fat: adjustedFat,
    confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
  };
};

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

    const { comment = '' } = req.body;

    // Analyze the image
    const analysis = await analyzeFoodImage(req.file.buffer, comment);

    res.json({
      success: true,
      data: {
        name: analysis.name,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        confidence: analysis.confidence,
        comment: comment
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get AI service status
// @route   GET /api/ai/status
// @access  Private
router.get('/status', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'operational',
        service: 'mock-ai-service',
        version: '1.0.0',
        features: ['food-recognition', 'calorie-estimation', 'nutrition-analysis']
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 