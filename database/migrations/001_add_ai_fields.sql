-- Migration: Add AI-related fields to meals table
-- Date: 2024-01-XX
-- Description: Add fields for AI analysis metadata

-- Add new columns to meals table
ALTER TABLE `meals` 
ADD COLUMN `language` VARCHAR(5) DEFAULT 'en' AFTER `comment`,
ADD COLUMN `ai_confidence` DECIMAL(3,2) DEFAULT 0.00 AFTER `language`,
ADD COLUMN `ai_provider` VARCHAR(50) DEFAULT 'openai' AFTER `ai_confidence`,
ADD COLUMN `portions` TEXT AFTER `ai_provider`,
ADD COLUMN `regional` BOOLEAN DEFAULT FALSE AFTER `portions`;

-- Add index for language-based queries
CREATE INDEX `idx_meals_language` ON `meals` (`language`);

-- Add index for confidence filtering
CREATE INDEX `idx_meals_confidence` ON `meals` (`ai_confidence`);

-- Add index for regional foods
CREATE INDEX `idx_meals_regional` ON `meals` (`regional`);

-- Update existing records to have default language based on user preferences
-- This can be run after migration
-- UPDATE meals m 
-- JOIN users u ON m.user_id = u.id 
-- SET m.language = u.language 
-- WHERE m.language = 'en' AND u.language IS NOT NULL; 