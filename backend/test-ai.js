const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import AI service
const aiService = require('./src/services/aiAnalysisService');

async function testAI() {
  console.log('🧪 Testing AI Analysis Service\n');

  try {
    // Test 1: Service status
    console.log('1. Testing service status...');
    const status = await aiService.getStatus();
    console.log('✅ Status:', status.status);
    console.log('📊 Supported languages:', status.supportedLanguages);
    console.log('🔧 Cache enabled:', status.cache?.enabled);
    console.log('');

    // Test 2: Create a simple test image (1x1 pixel PNG)
    console.log('2. Testing with sample image...');
    
    // Simple 1x1 black PNG image as Buffer
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    // Test different languages
    const languages = ['ru', 'en', 'uk', 'pl', 'es'];
    const comments = {
      ru: 'большая порция борща с сметаной',
      en: 'large portion of soup with cream',
      uk: 'велика порція борщу зі сметаною',
      pl: 'duża porcja zupy ze śmietaną',
      es: 'gran porción de sopa con crema'
    };

    for (const lang of languages) {
      console.log(`\n🌍 Testing language: ${lang}`);
      console.log(`💬 Comment: "${comments[lang]}"`);
      
      try {
        const result = await aiService.analyzeImage(
          testImageBuffer,
          comments[lang],
          lang
        );
        
        console.log('✅ Analysis result:');
        console.log(`   🍽️  Name: ${result.name}`);
        console.log(`   🔥 Calories: ${result.calories}`);
        console.log(`   🥩 Protein: ${result.protein}g`);
        console.log(`   🍞 Carbs: ${result.carbs}g`);
        console.log(`   🧈 Fat: ${result.fat}g`);
        console.log(`   📊 Confidence: ${Math.round(result.confidence * 100)}%`);
        console.log(`   🏠 Regional: ${result.regional ? 'Yes' : 'No'}`);
        console.log(`   🤖 Provider: ${result.provider}`);
        
      } catch (error) {
        console.log(`❌ Error for ${lang}:`, error.message);
      }
    }

    // Test 3: Cache functionality
    console.log('\n3. Testing cache functionality...');
    if (status.cache?.enabled) {
      console.log('🔄 Testing cache with same image...');
      const start = Date.now();
      await aiService.analyzeImage(testImageBuffer, comments.ru, 'ru');
      const end = Date.now();
      console.log(`⚡ Cached result returned in ${end - start}ms`);
    } else {
      console.log('⚠️ Cache is disabled');
    }

    console.log('\n🎉 AI Testing completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure to set OPENAI_API_KEY in your .env file');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Check your internet connection');
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testAI();
}

module.exports = { testAI }; 