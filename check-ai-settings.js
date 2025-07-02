const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAISettings() {
  let connection;
  
  try {
    console.log('🔍 Проверка настроек AI в базе данных...');
    
    // Подключение к БД
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root', 
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'snapcal',
      charset: 'utf8mb4'
    });

    console.log('✅ Подключение к БД установлено');

    // Проверяем текущие настройки
    const [rows] = await connection.execute('SELECT * FROM ai_settings ORDER BY setting_key');
    
    console.log('\n📊 Текущие настройки AI:');
    console.log('==========================================');
    for (const row of rows) {
      console.log(`${row.setting_key}: ${row.setting_value}`);
    }

    // Проверяем критичные настройки
    const criticalSettings = {
      'active_ai_provider': 'openai',
      'openai_enabled': 'true',
      'gemini_enabled': 'true'
    };

    console.log('\n🔧 Проверка и исправление критичных настроек...');
    
    for (const [key, expectedValue] of Object.entries(criticalSettings)) {
      const [existing] = await connection.execute(
        'SELECT setting_value FROM ai_settings WHERE setting_key = ?',
        [key]
      );
      
      const currentValue = existing.length > 0 ? existing[0].setting_value : null;
      
      if (currentValue !== expectedValue) {
        console.log(`⚠️  ${key}: ${currentValue} → ${expectedValue}`);
        
        await connection.execute(`
          INSERT INTO ai_settings (setting_key, setting_value, description)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          updated_at = CURRENT_TIMESTAMP
        `, [key, expectedValue, `Fixed by check script`]);
        
        console.log(`✅ ${key} исправлен`);
      } else {
        console.log(`✅ ${key}: ${currentValue} (OK)`);
      }
    }

    console.log('\n🎉 Проверка завершена!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Соединение с БД закрыто');
    }
  }
}

 