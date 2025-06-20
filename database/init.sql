-- SnapCal Database Initialization Script for MySQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `language` VARCHAR(10) DEFAULT 'en',
  `age` INT DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `height` INT DEFAULT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `activity_level` VARCHAR(50) DEFAULT NULL,
  `goal` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meals table
CREATE TABLE IF NOT EXISTS `meals` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `calories` INT NOT NULL,
  `protein` DECIMAL(5,2) DEFAULT '0.00',
  `carbs` DECIMAL(5,2) DEFAULT '0.00',
  `fat` DECIMAL(5,2) DEFAULT '0.00',
  `image_uri` TEXT,
  `comment` TEXT,
  `is_favorite` BOOLEAN DEFAULT FALSE,
  `date` DATE NOT NULL,
  `timestamp` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meals_user_id` (`user_id`),
  KEY `idx_meals_date` (`date`),
  KEY `idx_meals_user_date` (`user_id`, `date`),
  CONSTRAINT `meals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note on indexes: In MySQL, `KEY` is a synonym for `INDEX`.
-- Indexes are created within the `CREATE TABLE` statement for simplicity.
-- The UNIQUE KEY on `email` also creates an index.

-- Insert sample data for testing (optional)
-- INSERT INTO `users` (id, name, email, password_hash, language) VALUES 
-- ('3a9f4e3c-1b7c-4a3d-9d4a-5f2c1b7e4a3d', 'Test User', 'test@example.com', '$2a$10$example.hash', 'en');

-- INSERT INTO `meals` (id, user_id, name, calories, protein, carbs, fat, date, timestamp) VALUES 
-- ('4b8e2c1a-9f4a-4c2d-8b7a-6e3d2c1b7a4d', '3a9f4e3c-1b7c-4a3d-9d4a-5f2c1b7e4a3d', 'Sample Meal', 300, 15, 30, 10, CURDATE(), UNIX_TIMESTAMP() * 1000); 