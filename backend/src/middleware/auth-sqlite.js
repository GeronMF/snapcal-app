const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/database-sqlite');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await queryOne(
      'SELECT id, name, email, language, age, gender, height, weight, activity_level, goal FROM users WHERE id = ?',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize }; 