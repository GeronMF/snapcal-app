console.log('🚀 Запуск проверки настроек AI...');

const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  console.log('📦 Подключение к БД...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snapcal',
    charset: 'utf8mb4'
  });
  
  console.log('✅ Соединение установлено');
  
  const [rows] = await connection.execute('SELECT setting_key, setting_value FROM ai_settings');
  
  console.log('\n📊 Настройки AI:');
  for (const row of rows) {
    console.log(`  ${row.setting_key} = ${row.setting_value}`);
  }
  
  await connection.end();
  console.log('\n✅ Готово');
}

main().catch(console.error); 