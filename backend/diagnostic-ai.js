#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 SnapCal AI Диагностика\n');

// Проверка конфигурации
function checkConfig() {
  console.log('📋 Проверка конфигурации:');
  
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  console.log(`   .env файл: ${envExists ? '✅ Найден' : '❌ Отсутствует'}`);
  
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=') && 
                        !envContent.includes('OPENAI_API_KEY=your_api_key_here');
    console.log(`   OpenAI API ключ: ${hasOpenAIKey ? '✅ Настроен' : '❌ Не настроен'}`);
    
    const hasAICache = envContent.includes('AI_CACHE_ENABLED=');
    console.log(`   AI кэш: ${hasAICache ? '✅ Настроен' : '⚠️ По умолчанию'}`);
    
    const hasFallback = envContent.includes('AI_FALLBACK_ENABLED=');
    console.log(`   AI fallback: ${hasFallback ? '✅ Настроен' : '⚠️ По умолчанию'}`);
  }
  
  console.log();
}

// Проверка файловой структуры
function checkFileStructure() {
  console.log('📁 Проверка файловой структуры:');
  
  const requiredFiles = [
    'src/services/aiAnalysisService.js',
    'src/routes/ai.js', 
    'src/config/aiPrompts.js',
    'src/config/aiConfig.js',
    'src/middleware/requestLogger.js',
    'src/middleware/auth-mysql.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
  });
  
  console.log();
}

// Проверка зависимостей
function checkDependencies() {
  console.log('📦 Проверка зависимостей:');
  
  try {
    const packageJson = require('./package.json');
    const requiredDeps = [
      'openai',
      'sharp',
      'express',
      'multer',
      'mysql2'
    ];
    
    requiredDeps.forEach(dep => {
      const installed = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      console.log(`   ${dep}: ${installed ? `✅ v${installed}` : '❌ Не установлено'}`);
    });
    
  } catch (error) {
    console.log('   ❌ Не удалось прочитать package.json');
  }
  
  console.log();
}

// Рекомендации по решению проблем
function provideRecommendations() {
  console.log('💡 Рекомендации по решению проблем:');
  
  console.log('   🔧 При проблемах с GIF анимацией:');
  console.log('      - Убедитесь что файл ai-loading.gif существует в frontend/assets/images/');
  console.log('      - Проверьте предзагрузку GIF при запуске приложения');
  console.log('      - Используйте fallback ActivityIndicator при ошибках загрузки');
  
  console.log('\n   ⏰ При таймаутах:');
  console.log('      - Увеличьте таймауты в конфигурации (120s для frontend, 60s для OpenAI)');
  console.log('      - Добавьте retry механизм с экспоненциальной задержкой');
  console.log('      - Оптимизируйте размер изображений перед отправкой');
  
  console.log('\n   🌐 При сетевых проблемах:');
  console.log('      - Реализуйте повторные попытки с задержкой');
  console.log('      - Добавьте детальное логирование ошибок');
  console.log('      - Используйте fallback анализ при недоступности AI');
  
  console.log();
}

// Запуск всех проверок
async function runDiagnostics() {
  try {
    checkConfig();
    checkFileStructure();
    checkDependencies();
    provideRecommendations();
    
    console.log('✅ Диагностика завершена!');
    console.log('📝 Для дальнейшей диагностики проверьте логи сервера и frontend приложения.');
    
  } catch (error) {
    console.error('❌ Ошибка диагностики:', error.message);
  }
}

// Запуск
runDiagnostics(); 