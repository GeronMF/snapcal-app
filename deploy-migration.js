#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Чтение переменных окружения из .env файла
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Подключение к базе данных
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'snapcal',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
    });

    console.log('✅ Подключено к базе данных MySQL');

    // Чтение миграции
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_missing_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Выполняем миграцию...');

    // Разделяем SQL на отдельные команды
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (const command of commands) {
      try {
        if (command.trim()) {
          console.log(`🔧 Выполняем: ${command.substring(0, 50)}...`);
          await connection.execute(command);
          console.log('✅ Успешно');
        }
      } catch (error) {
        // Игнорируем ошибки о дубликатах колонок/индексов
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.message.includes('Duplicate column name') ||
            error.message.includes('Duplicate key name')) {
          console.log(`⚠️ Поле/индекс уже существует, пропускаем: ${error.message}`);
        } else {
          console.error(`❌ Ошибка выполнения команды: ${command}`);
          console.error(`❌ ${error.message}`);
          throw error;
        }
      }
    }

    console.log('🎉 Миграция выполнена успешно!');

    // Проверяем что новые поля добавлены
    console.log('🔍 Проверяем структуру таблиц...');
    
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const hasDailyCaloriesColumn = usersColumns.some(col => col.Field === 'daily_calories');
    console.log(`📊 users.daily_calories: ${hasDailyCaloriesColumn ? '✅ Есть' : '❌ Отсутствует'}`);

    const [mealsColumns] = await connection.execute('DESCRIBE meals');
    const hasConfidenceColumn = mealsColumns.some(col => col.Field === 'ai_confidence');
    const hasLanguageColumn = mealsColumns.some(col => col.Field === 'language');
    const hasProviderColumn = mealsColumns.some(col => col.Field === 'ai_provider');
    
    console.log(`📊 meals.ai_confidence: ${hasConfidenceColumn ? '✅ Есть' : '❌ Отсутствует'}`);
    console.log(`📊 meals.language: ${hasLanguageColumn ? '✅ Есть' : '❌ Отсутствует'}`);
    console.log(`📊 meals.ai_provider: ${hasProviderColumn ? '✅ Есть' : '❌ Отсутствует'}`);

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Соединение с БД закрыто');
    }
  }
}

// Запуск миграции
runMigration(); 