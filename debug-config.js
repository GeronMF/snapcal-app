console.log('🔍 Отладка конфигурации AI...');

const AISettingsService = require('./src/services/AISettingsService');

async function main() {
  const aiSettings = new AISettingsService();
  const config = await aiSettings.getAIManagerConfig();
  
  console.log('\n📊 Полная конфигурация AI:');
  console.log(JSON.stringify(config, null, 2));
  
  console.log('\n🔍 Проверка типов:');
  console.log('openai.enabled:', config.openai.enabled, typeof config.openai.enabled);
  console.log('gemini.enabled:', config.gemini.enabled, typeof config.gemini.enabled);
  
  console.log('\n🧪 Тест условий:');
  console.log('config.openai.enabled !== false:', config.openai.enabled !== false);
  console.log('config.openai.enabled === true:', config.openai.enabled === true);
  console.log('Boolean(config.openai.enabled):', Boolean(config.openai.enabled));
}

main().catch(console.error); 