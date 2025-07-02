const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const aiProviderManager = require('../services/aiProviders/AIProviderManager');
const AISettingsService = require('../services/AISettingsService');
const { query } = require('../config/database');

const router = express.Router();

// Используем adminAuth middleware для всех админских роутов

// @desc    Get AI providers status and settings
// @route   GET /api/admin/ai/status
// @access  Admin only (Basic Auth)
router.get('/status', adminAuth, async (req, res, next) => {
  try {
    const aiSettings = new AISettingsService();
    
    const [providersStatus, settings, usageStats] = await Promise.all([
      aiProviderManager.getProvidersStatus(),
      aiSettings.getAllSettings(),
      aiSettings.getAIUsageStats(7) // Last 7 days
    ]);

    const activeProvider = aiProviderManager.getActiveProviderInfo();

    res.json({
      success: true,
      data: {
        activeProvider,
        providers: providersStatus,
        settings,
        usageStats,
        systemInfo: {
          version: '3.0.0',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      }
    });
  } catch (error) {
    console.error('Admin AI status error:', error);
    next(error);
  }
});

// @desc    Switch active AI provider
// @route   POST /api/admin/ai/switch
// @access  Admin only (Basic Auth)
router.post('/switch', adminAuth, async (req, res, next) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider name is required'
      });
    }

    const aiSettings = new AISettingsService();

    // Update settings in database
    await aiSettings.setActiveProvider(provider);

    // Switch provider in manager
    await aiProviderManager.setActiveProvider(provider);

    const activeProvider = aiProviderManager.getActiveProviderInfo();

    console.log(`🔄 Admin switched AI provider to: ${provider}`);

    res.json({
      success: true,
      data: {
        message: `AI провайдер переключен на ${provider}`,
        activeProvider
      }
    });
  } catch (error) {
    console.error('Admin AI switch error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Enable/disable AI provider
// @route   POST /api/admin/ai/toggle
// @access  Admin only (Basic Auth)
router.post('/toggle', adminAuth, async (req, res, next) => {
  try {
    const { provider, enabled } = req.body;

    if (!provider || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Provider name and enabled status are required'
      });
    }

    const aiSettings = new AISettingsService();

    // Update settings in database
    await aiSettings.setProviderEnabled(provider, enabled);

    // Update provider in manager
    aiProviderManager.setProviderEnabled(provider, enabled);

    console.log(`${enabled ? '✅' : '❌'} Admin ${enabled ? 'enabled' : 'disabled'} AI provider: ${provider}`);

    res.json({
      success: true,
      data: {
        message: `Провайдер ${provider} ${enabled ? 'включен' : 'отключен'}`,
        provider,
        enabled
      }
    });
  } catch (error) {
    console.error('Admin AI toggle error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update AI provider priority
// @route   POST /api/admin/ai/priority
// @access  Admin only (Basic Auth)
router.post('/priority', adminAuth, async (req, res, next) => {
  try {
    const { provider, priority } = req.body;

    if (!provider || typeof priority !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Provider name and priority are required'
      });
    }

    const aiSettings = new AISettingsService();

    // Update priority in database
    await aiSettings.setProviderPriority(provider, priority);

    console.log(`🎯 Admin updated AI provider priority: ${provider} = ${priority}`);

    res.json({
      success: true,
      data: {
        message: `Приоритет провайдера ${provider} установлен: ${priority}`,
        provider,
        priority
      }
    });
  } catch (error) {
    console.error('Admin AI priority error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update AI settings
// @route   POST /api/admin/ai/settings
// @access  Admin only (Basic Auth)
router.post('/settings', adminAuth, async (req, res, next) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required'
      });
    }

    const aiSettings = new AISettingsService();

    // Update multiple settings
    const updatePromises = Object.entries(settings).map(([key, value]) => 
      aiSettings.setSetting(key, value)
    );

    await Promise.all(updatePromises);

    // Clear cache to reload settings
    aiSettings.clearCache();

    console.log(`⚙️ Admin updated AI settings:`, Object.keys(settings));

    res.json({
      success: true,
      data: {
        message: `Обновлено настроек: ${Object.keys(settings).length}`,
        updated: Object.keys(settings)
      }
    });
  } catch (error) {
    console.error('Admin AI settings error:', error);
    next(error);
  }
});

// @desc    Test AI provider
// @route   POST /api/admin/ai/test
// @access  Admin only (Basic Auth)
router.post('/test', adminAuth, async (req, res, next) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider name is required'
      });
    }

    // Create test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x99, 0xE6, 0x8C, 0x88, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);

    const testStart = Date.now();

    // Test specific provider
    const originalActive = aiProviderManager.activeProvider;
    await aiProviderManager.setActiveProvider(provider);

    const result = await aiProviderManager.analyzeImage(
      testImageBuffer, 
      'en', 
      'Test image from admin panel'
    );

    // Restore original provider
    if (originalActive) {
      aiProviderManager.activeProvider = originalActive;
    }

    const testDuration = Date.now() - testStart;

    console.log(`🧪 Admin tested AI provider ${provider}: ${testDuration}ms`);

    res.json({
      success: true,
      data: {
        message: `Провайдер ${provider} работает корректно`,
        provider,
        result,
        testDuration,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Admin AI test error for ${req.body.provider}:`, error);
    res.status(500).json({
      success: false,
      error: `Тест провайдера ${req.body.provider} неудачен: ${error.message}`
    });
  }
});

// @desc    Get AI usage statistics
// @route   GET /api/admin/ai/stats
// @access  Admin only (Basic Auth)
router.get('/stats', adminAuth, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const aiSettings = new AISettingsService();
    
    const usageStats = await aiSettings.getAIUsageStats(parseInt(days));

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        stats: usageStats,
        generated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin AI stats error:', error);
    next(error);
  }
});

// @desc    Get users statistics by language
// @route   GET /api/admin/ai/users-stats
// @access  Admin only (Basic Auth)
router.get('/users-stats', adminAuth, async (req, res, next) => {
  try {
    // Статистика пользователей по языкам
    const [usersByLanguage] = await query(`
      SELECT 
        language, 
        COUNT(*) as count
      FROM users 
      WHERE language IS NOT NULL 
      GROUP BY language 
      ORDER BY count DESC
    `);

    // Общее количество пользователей
    const [totalUsers] = await query('SELECT COUNT(*) as total FROM users');

    res.json({
      success: true,
      data: {
        usersByLanguage,
        totalUsers: totalUsers[0].total,
        generated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin users stats error:', error);
    next(error);
  }
});

// @desc    Get meals statistics
// @route   GET /api/admin/ai/meals-stats
// @access  Admin only (Basic Auth)
router.get('/meals-stats', adminAuth, async (req, res, next) => {
  try {
    // Общее количество загруженных блюд
    const [totalMeals] = await query('SELECT COUNT(*) as total FROM meals');

    // Количество блюд по провайдерам ИИ
    const [mealsByProvider] = await query(`
      SELECT 
        ai_provider, 
        COUNT(*) as count
      FROM meals 
      WHERE ai_provider IS NOT NULL 
      GROUP BY ai_provider 
      ORDER BY count DESC
    `);

    // Статистика по дням за последнюю неделю
    const [mealsPerDay] = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM meals 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        totalMeals: totalMeals[0].total,
        mealsByProvider,
        mealsPerDay,
        generated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin meals stats error:', error);
    next(error);
  }
});

module.exports = router; 