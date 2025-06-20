const express = require('express');
const { protect } = require('../middleware/auth-mysql');
const { query } = require('../config/database');

const router = express.Router();

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { 
      name, 
      language, 
      age, 
      gender, 
      height, 
      weight, 
      activityLevel, 
      goal 
    } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (language !== undefined) {
      updateFields.push('language = ?');
      values.push(language);
    }
    if (age !== undefined) {
      updateFields.push('age = ?');
      values.push(age);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(gender);
    }
    if (height !== undefined) {
      updateFields.push('height = ?');
      values.push(height);
    }
    if (weight !== undefined) {
      updateFields.push('weight = ?');
      values.push(weight);
    }
    if (activityLevel !== undefined) {
      updateFields.push('activity_level = ?');
      values.push(activityLevel);
    }
    if (goal !== undefined) {
      updateFields.push('goal = ?');
      values.push(goal);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(req.user.id);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const [[updatedUser]] = await query(
      'SELECT id, name, email, language, age, gender, height, weight, activity_level, goal FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [req.user.id];

    if (startDate && endDate) {
      dateFilter = 'AND date >= ? AND date <= ?';
      params.push(startDate, endDate);
    }

    const [[mealsCountResult]] = await query(
      `SELECT COUNT(*) as total_meals FROM meals WHERE user_id = ? ${dateFilter}`,
      params
    );

    const [[caloriesResult]] = await query(
      `SELECT COALESCE(SUM(calories), 0) as total_calories FROM meals WHERE user_id = ? ${dateFilter}`,
      params
    );

    const [[avgCaloriesResult]] = await query(
      `SELECT COALESCE(AVG(daily_calories), 0) as avg_calories_per_day 
       FROM (
         SELECT date, SUM(calories) as daily_calories 
         FROM meals 
         WHERE user_id = ? ${dateFilter}
         GROUP BY date
       ) daily_totals`,
      params
    );

    const [[favoritesResult]] = await query(
      `SELECT COUNT(*) as favorite_meals FROM meals WHERE user_id = ? AND is_favorite = true ${dateFilter}`,
      params
    );

    const stats = {
      totalMeals: parseInt(mealsCountResult.total_meals),
      totalCalories: parseInt(caloriesResult.total_calories),
      avgCaloriesPerDay: Math.round(parseFloat(avgCaloriesResult.avg_calories_per_day)),
      favoriteMeals: parseInt(favoritesResult.favorite_meals)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 