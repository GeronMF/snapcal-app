const express = require('express');
const { protect } = require('../middleware/auth-sqlite');
const { query, queryOne, run } = require('../config/database-sqlite');

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

    // Add updated_at and user_id
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await run(
      `UPDATE users 
       SET ${updateFields.join(', ')} 
       WHERE id = ?`,
      values
    );

    // Get updated user
    const result = await queryOne(
      'SELECT id, name, email, language, age, gender, height, weight, activity_level, goal FROM users WHERE id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          language: updatedUser.language,
          age: updatedUser.age,
          gender: updatedUser.gender,
          height: updatedUser.height,
          weight: updatedUser.weight,
          activityLevel: updatedUser.activity_level,
          goal: updatedUser.goal
        }
      }
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

    // Get total meals count
    const mealsCountResult = await query(
      `SELECT COUNT(*) as total_meals FROM meals WHERE user_id = ? ${dateFilter}`,
      params
    );

    // Get total calories
    const caloriesResult = await query(
      `SELECT COALESCE(SUM(calories), 0) as total_calories FROM meals WHERE user_id = ? ${dateFilter}`,
      params
    );

    // Get average calories per day
    const avgCaloriesResult = await query(
      `SELECT COALESCE(AVG(daily_calories), 0) as avg_calories_per_day 
       FROM (
         SELECT date, SUM(calories) as daily_calories 
         FROM meals 
         WHERE user_id = ? ${dateFilter}
         GROUP BY date
       ) daily_totals`,
      params
    );

    // Get favorite meals count
    const favoritesResult = await query(
      `SELECT COUNT(*) as favorite_meals FROM meals WHERE user_id = ? AND is_favorite = 1 ${dateFilter}`,
      params
    );

    const stats = {
      totalMeals: parseInt(mealsCountResult.rows[0].total_meals),
      totalCalories: parseInt(caloriesResult.rows[0].total_calories),
      avgCaloriesPerDay: Math.round(parseFloat(avgCaloriesResult.rows[0].avg_calories_per_day)),
      favoriteMeals: parseInt(favoritesResult.rows[0].favorite_meals)
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