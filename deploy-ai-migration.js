const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Deploy AI provider migration to production
 */
async function deployAIMigration() {
  console.log('🚀 Starting AI Provider Migration deployment...');
  
  let connection;
  
  try {
    // Подключение к базе данных
    console.log('📦 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'snapcal',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Database connected successfully');

    // Проверка текущего состояния БД
    console.log('\n📊 Checking current database state...');
    
    // Проверяем таблицы
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log('🗃️ Existing tables:', tableNames.join(', '));
    
    // Проверяем структуру таблицы users
    if (tableNames.includes('users')) {
      const [usersStructure] = await connection.execute("DESCRIBE users");
      console.log('👤 Users table structure:');
      usersStructure.forEach(col => {
        if (col.Field === 'id') {
          console.log(`   id: ${col.Type} ${col.Key} ${col.Extra}`);
        }
      });
    }
    
    const hasAiSettings = tableNames.includes('ai_settings');
    const hasAiUsageStats = tableNames.includes('ai_usage_stats');
    
    console.log(`📊 ai_settings table: ${hasAiSettings ? '✅ Exists' : '❌ Missing'}`);
    console.log(`📊 ai_usage_stats table: ${hasAiUsageStats ? '✅ Exists' : '❌ Missing'}`);

    // Читаем и выполняем миграцию
    console.log('\n🔄 Executing AI migration...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/003_ai_settings.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');
    console.log(`📊 File size: ${migrationSQL.length} characters`);
    console.log(`📊 First 200 characters: ${migrationSQL.substring(0, 200).replace(/\r?\n/g, '\\n')}`);
    
    // Разбиваем миграцию на отдельные команды
    const sqlCommands = migrationSQL
      .replace(/\r\n/g, '\n') // Нормализуем line endings
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => {
        // Убираем пустые команды и комментарии
        const lines = cmd.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
        return lines.length > 0;
      });
    
    console.log(`📊 Found ${sqlCommands.length} SQL commands to execute`);
    
    // Показываем первые 100 символов каждой команды для отладки
    sqlCommands.forEach((cmd, i) => {
      console.log(`📝 Command ${i + 1}: ${cmd.substring(0, 100).replace(/\n/g, ' ')}...`);
    });
    
    // Выполняем команды по одной
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.length > 0) {
        try {
          console.log(`⏳ Executing command ${i + 1}/${sqlCommands.length}...`);
          await connection.execute(command);
          console.log(`✅ Command ${i + 1} executed successfully`);
        } catch (cmdError) {
          console.error(`❌ Command ${i + 1} failed:`, cmdError.message);
          console.log('Failed command:', command.substring(0, 100) + '...');
          throw cmdError;
        }
      }
    }
    
    console.log('✅ AI migration executed successfully');

    // Проверяем результат
    console.log('\n📊 Verifying migration results...');
    
    const [newTables] = await connection.execute("SHOW TABLES");
    const newTableNames = newTables.map(row => Object.values(row)[0]);
    
    const nowHasAiSettings = newTableNames.includes('ai_settings');
    const nowHasAiUsageStats = newTableNames.includes('ai_usage_stats');
    
    console.log(`📊 ai_settings table: ${nowHasAiSettings ? '✅ Created/Exists' : '❌ Failed'}`);
    console.log(`📊 ai_usage_stats table: ${nowHasAiUsageStats ? '✅ Created/Exists' : '❌ Failed'}`);

    // Проверяем настройки AI
    if (nowHasAiSettings) {
      const [settings] = await connection.execute('SELECT setting_key, setting_value FROM ai_settings');
      console.log('\n⚙️ AI Settings:');
      settings.forEach(setting => {
        console.log(`   ${setting.setting_key}: ${setting.setting_value}`);
      });
    }

    // Устанавливаем Gemini ключ если нужно
    if (nowHasAiSettings && process.env.GEMINI_API_KEY) {
      console.log('\n🔑 Setting up Gemini API key...');
      
      // Проверяем есть ли уже ключ
      const [existingKeys] = await connection.execute(
        "SELECT setting_value FROM ai_settings WHERE setting_key = 'gemini_api_key'"
      );
      
      if (existingKeys.length === 0) {
        await connection.execute(`
          INSERT INTO ai_settings (setting_key, setting_value, description)
          VALUES ('gemini_api_key', ?, 'Gemini API key for AI analysis')
        `, [process.env.GEMINI_API_KEY]);
        console.log('✅ Gemini API key added to settings');
      } else {
        console.log('ℹ️ Gemini API key already exists in settings');
      }
    }

    console.log('\n🎉 AI Provider Migration deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart the application: node src/index.js');
    console.log('2. Check AI status: GET /api/ai/status');
    console.log('3. Test Admin AI: GET /api/admin/ai/status');
    console.log('4. Try Gemini provider: POST /api/admin/ai/switch {"provider": "gemini"}');

  } catch (error) {
    console.error('\n❌ Migration deployment failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Запуск миграции
deployAIMigration(); 