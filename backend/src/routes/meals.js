const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// @desc    Get all meals for user
// @route   GET /api/meals
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { date, limit = 50, offset = 0 } = req.query;
    
    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 1;

    if (date) {
      whereClause += ` AND date = $${++paramCount}`;
      params.push(date);
    }

    const result = await query(
      `SELECT id, name, calories, protein, carbs, fat, image_uri, comment, 
              is_favorite, date, timestamp, created_at
       FROM meals 
       ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${++paramCount} OFFSET $${++paramCount}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: result.rows.map(meal => ({
        id: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: parseFloat(meal.protein),
        carbs: parseFloat(meal.carbs),
        fat: parseFloat(meal.fat),
        imageUri: meal.image_uri,
        comment: meal.comment,
        isFavorite: meal.is_favorite,
        date: meal.date,
        timestamp: parseInt(meal.timestamp),
        createdAt: meal.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, calories, protein, carbs, fat, image_uri, comment, 
              is_favorite, date, timestamp, created_at
       FROM meals 
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    const meal = result.rows[0];

    res.json({
      success: true,
      data: {
        id: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: parseFloat(meal.protein),
        carbs: parseFloat(meal.carbs),
        fat: parseFloat(meal.fat),
        imageUri: meal.image_uri,
        comment: meal.comment,
        isFavorite: meal.is_favorite,
        date: meal.date,
        timestamp: parseInt(meal.timestamp),
        createdAt: meal.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { 
      name, 
      calories, 
      protein = 0, 
      carbs = 0, 
      fat = 0, 
      imageUri, 
      comment, 
      date 
    } = req.body;

    if (!name || !calories) {
      return res.status(400).json({
        success: false,
        error: 'Name and calories are required'
      });
    }

    const mealDate = date || new Date().toISOString().split('T')[0];
    const timestamp = Date.now();

    const result = await query(
      `INSERT INTO meals (user_id, name, calories, protein, carbs, fat, image_uri, comment, date, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, calories, protein, carbs, fat, image_uri, comment, is_favorite, date, timestamp, created_at`,
      [req.user.id, name, calories, protein, carbs, fat, imageUri, comment, mealDate, timestamp]
    );

    const meal = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: meal.id,
        name: meal.name,
        calories: meal.calories,
        protein: parseFloat(meal.protein),
        carbs: parseFloat(meal.carbs),
        fat: parseFloat(meal.fat),
        imageUri: meal.image_uri,
        comment: meal.comment,
        isFavorite: meal.is_favorite,
        date: meal.date,
        timestamp: parseInt(meal.timestamp),
        createdAt: meal.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      calories, 
      protein, 
      carbs, 
      fat, 
      imageUri, 
      comment, 
      isFavorite 
    } = req.body;

    // Check if meal exists and belongs to user
    const existingMeal = await query(
      'SELECT id FROM meals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingMeal.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (calories !== undefined) {
      updateFields.push(`calories = $${paramCount++}`);
      values.push(calories);
    }

    if (protein !== undefined) {
      updateFields.push(`protein = $${paramCount++}`);
      values.push(protein);
    }

    if (carbs !== undefined) {
      updateFields.push(`carbs = $${paramCount++}`);
      values.push(carbs);
    }

    if (fat !== undefined) {
      updateFields.push(`fat = $${paramCount++}`);
      values.push(fat);
    }

    if (imageUri !== undefined) {
      updateFields.push(`image_uri = $${paramCount++}`);
      values.push(imageUri);
    }

    if (comment !== undefined) {
      updateFields.push(`comment = $${paramCount++}`);
      values.push(comment);
    }

    if (isFavorite !== undefined) {
      updateFields.push(`is_favorite = $${paramCount++}`);
      values.push(isFavorite);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, req.user.id);

    const result = await query(
      `UPDATE meals 
       SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, name, calories, protein, carbs, fat, image_uri, comment, is_favorite, date, timestamp, created_at`,
      values
    );

    const updatedMeal = result.rows[0];

    res.json({
      success: true,
      data: {
        id: updatedMeal.id,
        name: updatedMeal.name,
        calories: updatedMeal.calories,
        protein: parseFloat(updatedMeal.protein),
        carbs: parseFloat(updatedMeal.carbs),
        fat: parseFloat(updatedMeal.fat),
        imageUri: updatedMeal.image_uri,
        comment: updatedMeal.comment,
        isFavorite: updatedMeal.is_favorite,
        date: updatedMeal.date,
        timestamp: parseInt(updatedMeal.timestamp),
        createdAt: updatedMeal.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload meal image
// @route   POST /api/meals/upload
// @access  Private
router.post('/upload', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        imageUri: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 