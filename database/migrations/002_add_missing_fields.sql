-- Migration: Add missing fields to users and meals tables
-- Date: 2025-01-07
-- Description: Add daily_calories to users and AI fields to meals

-- Add daily_calories column to users table
ALTER TABLE `users` 
ADD COLUMN `daily_calories` INT DEFAULT NULL AFTER `goal`;

-- Add AI-related columns to meals table (if not exist)
ALTER TABLE `meals` 
ADD COLUMN `confidence` DECIMAL(3,2) DEFAULT 0.00 AFTER `comment`,
ADD COLUMN `language` VARCHAR(5) DEFAULT 'en' AFTER `confidence`,
ADD COLUMN `ai_provider` VARCHAR(50) DEFAULT 'manual' AFTER `language`,
ADD COLUMN `portions` TEXT AFTER `ai_provider`,
ADD COLUMN `regional` BOOLEAN DEFAULT FALSE AFTER `portions`;

-- Add indexes for AI fields
CREATE INDEX IF NOT EXISTS `idx_meals_confidence` ON `meals` (`confidence`);
CREATE INDEX IF NOT EXISTS `idx_meals_language` ON `meals` (`language`);
CREATE INDEX IF NOT EXISTS `idx_meals_ai_provider` ON `meals` (`ai_provider`);
CREATE INDEX IF NOT EXISTS `idx_meals_regional` ON `meals` (`regional`);

-- Update existing records to have proper language based on user preferences
UPDATE meals m 
JOIN users u ON m.user_id = u.id 
SET m.language = u.language 
WHERE m.language = 'en' AND u.language IS NOT NULL;

-- Set ai_provider to 'manual' for existing records where it's not set
UPDATE meals 
SET ai_provider = 'manual' 
WHERE ai_provider IS NULL; 