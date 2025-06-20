const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../snapcal.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Initialize database tables
const initializeTables = () => {
  return new Promise((resolve, reject) => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        age INTEGER,
        gender TEXT,
        height INTEGER,
        weight REAL,
        activity_level TEXT,
        goal TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        reject(err);
        return;
      }

      // Meals table
      db.run(`
        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          calories INTEGER NOT NULL,
          protein REAL DEFAULT 0,
          carbs REAL DEFAULT 0,
          fat REAL DEFAULT 0,
          image_uri TEXT,
          comment TEXT,
          is_favorite INTEGER DEFAULT 0,
          date TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating meals table:', err);
          reject(err);
          return;
        }

        // Create indexes
        db.run('CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id)', (err) => {
          if (err) console.error('Error creating index:', err);
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date)', (err) => {
          if (err) console.error('Error creating index:', err);
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
          if (err) console.error('Error creating index:', err);
        });

        console.log('✅ Database tables initialized successfully');
        resolve();
      });
    });
  });
};

// Helper function to run queries
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

// Helper function to run single query
const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows: row ? [row] : [] });
      }
    });
  });
};

// Helper function to run insert/update/delete
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes,
          rows: [{ id: this.lastID }]
        });
      }
    });
  });
};

// Connect to database
const connectDB = async () => {
  try {
    await initializeTables();
  } catch (error) {
    console.error('❌ Error initializing database tables:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  query,
  queryOne,
  run,
  db
}; 