const express = require('express');
const { protect } = require('../middleware/auth-sqlite');
const { query, queryOne, run } = require('../config/database-sqlite');
const { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  isValidEmail, 
  validatePassword 
} = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, language = 'en' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email'
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.message
      });
    }

    // Check if user already exists
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    // Create user
    await run(
      `INSERT INTO users (id, name, email, password_hash, language) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, language]
    );

    // Get created user
    const result = await queryOne(
      'SELECT id, name, email, language, age, gender, height, weight, activity_level, goal FROM users WHERE id = ?',
      [userId]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activity_level,
          goal: user.goal
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if user exists
    const result = await queryOne(
      'SELECT id, name, email, password_hash, language, age, gender, height, weight, activity_level, goal FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activity_level,
          goal: user.goal
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          language: req.user.language,
          age: req.user.age,
          gender: req.user.gender,
          height: req.user.height,
          weight: req.user.weight,
          activityLevel: req.user.activity_level,
          goal: req.user.goal
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 