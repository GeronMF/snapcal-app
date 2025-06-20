const mysql = require('mysql2/promise');

// Database configuration
let pool;

// Test the connection
const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'snapcal',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Initialize database tables
    await initializeTables();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        language VARCHAR(10) DEFAULT 'en',
        age INT,
        gender VARCHAR(20),
        height INT,
        weight DECIMAL(5,2),
        activity_level VARCHAR(50),
        goal VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Meals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        calories INT NOT NULL,
        protein DECIMAL(5,2) DEFAULT 0,
        carbs DECIMAL(5,2) DEFAULT 0,
        fat DECIMAL(5,2) DEFAULT 0,
        image_uri TEXT,
        comment TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        date DATE NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    if (error.code !== 'ER_DUP_KEYNAME') { // Ignore "duplicate key name" error for indexes
      console.error('❌ Error initializing database tables:', error.message);
      throw error;
    }
  }
};

// Helper function to run queries
const query = (text, params) => pool.query(text, params);

module.exports = {
  connectDB,
  query,
  pool
}; 