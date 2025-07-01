-- Migration: AI Provider Settings
-- Date: 2025-01-07
-- Description: Add table for managing AI provider settings

-- Create ai_settings table
CREATE TABLE IF NOT EXISTS `ai_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `description` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default AI provider settings
INSERT INTO `ai_settings` (`setting_key`, `setting_value`, `description`) VALUES
('active_ai_provider', 'openai', 'Currently active AI provider'),
('openai_enabled', 'true', 'Enable/disable OpenAI provider'),
('openai_priority', '1', 'Priority of OpenAI provider (lower = higher priority)'),
('gemini_enabled', 'true', 'Enable/disable Gemini provider'),
('gemini_priority', '2', 'Priority of Gemini provider (lower = higher priority)'),
('fallback_enabled', 'true', 'Enable fallback to alternative providers'),
('health_check_interval', '60000', 'Health check interval in milliseconds'),
('ai_timeout', '120000', 'AI analysis timeout in milliseconds'),
('ai_retry_attempts', '2', 'Number of retry attempts for AI analysis')
ON DUPLICATE KEY UPDATE 
`setting_value` = VALUES(`setting_value`),
`updated_at` = CURRENT_TIMESTAMP;

-- Create ai_usage_stats table for tracking usage
CREATE TABLE IF NOT EXISTS `ai_usage_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `provider` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50), -- Match users.id type
  `success` BOOLEAN NOT NULL DEFAULT FALSE,
  `response_time` INT, -- in milliseconds
  `error_message` TEXT,
  `language` VARCHAR(5),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_provider` (`provider`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grant necessary permissions (if needed)
-- GRANT SELECT, INSERT, UPDATE ON ai_settings TO 'snapcal_user'@'%';
-- GRANT SELECT, INSERT ON ai_usage_stats TO 'snapcal_user'@'%'; 