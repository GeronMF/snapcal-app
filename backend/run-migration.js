const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Настройки базы данных из .env
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'snapcal'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Подключаюсь к продакшн базе данных...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Подключение установлено');
    
    // Читаем миграцию
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '001_add_ai_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Читаю миграцию:', migrationPath);
    
    // Разбиваем SQL на отдельные команды
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Выполняю ${statements.length} SQL команд...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`${i + 1}. Выполняю: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
          console.log(`   ✅ Успешно`);
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`   ⚠️  Поле уже существует, пропускаю`);
          } else if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`   ⚠️  Индекс уже существует, пропускаю`);
          } else {
            console.error(`   ❌ Ошибка: ${error.message}`);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Миграция успешно применена!');
    
  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Соединение закрыто');
    }
  }
}

runMigration(); 