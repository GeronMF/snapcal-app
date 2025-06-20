const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth-mysql');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Multer configuration (remains the same)
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
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
      cb(null, true);
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
    
    let sql = 'SELECT * FROM meals WHERE user_id = ?';
    let params = [req.user.id];

    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [meals] = await query(sql, params);

    res.json({
      success: true,
      data: meals.map(meal => ({
        ...meal,
        isFavorite: Boolean(meal.is_favorite)
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
    const [meals] = await query('SELECT * FROM meals WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (meals.length === 0) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }
    
    const meal = meals[0];
    res.json({
      success: true,
      data: { ...meal, isFavorite: Boolean(meal.is_favorite) }
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
    const { name, calories, protein = 0, carbs = 0, fat = 0, imageUri, comment, date } = req.body;

    if (!name || calories === undefined) {
      return res.status(400).json({ success: false, error: 'Name and calories are required' });
    }

    const newMeal = {
      id: uuidv4(),
      user_id: req.user.id,
      name,
      calories,
      protein,
      carbs,
      fat,
      image_uri: imageUri,
      comment,
      date: date || new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    await query('INSERT INTO meals SET ?', newMeal);

    res.status(201).json({ success: true, data: newMeal });
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
    
    // Check if meal exists and belongs to user
    const [meals] = await query('SELECT id FROM meals WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (meals.length === 0) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    const updateData = { ...req.body };
    if (updateData.isFavorite !== undefined) {
      updateData.is_favorite = updateData.isFavorite;
      delete updateData.isFavorite;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    await query('UPDATE meals SET ? WHERE id = ?', [updateData, id]);
    
    const [[updatedMeal]] = await query('SELECT * FROM meals WHERE id = ?', [id]);

    res.json({
      success: true,
      data: { ...updatedMeal, isFavorite: Boolean(updatedMeal.is_favorite) }
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
    const [result] = await query('DELETE FROM meals WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload meal image
// @route   POST /api/meals/upload
// @access  Private
router.post('/upload', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file provided' });
  }
  const imageUri = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, data: { imageUri, filename: req.file.filename } });
});

module.exports = router; 