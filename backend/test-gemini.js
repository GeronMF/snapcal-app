const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import our AI providers
const GeminiProvider = require('./src/services/aiProviders/GeminiProvider');
const OpenAIProvider = require('./src/services/aiProviders/OpenAIProvider');
const AIProviderManager = require('./src/services/aiProviders/AIProviderManager');

/**
 * Test Gemini AI Provider
 */
async function testGeminiProvider() {
  console.log('🧪 Testing Gemini AI Provider\n');

  try {
    // Test 1: Initialize Gemini provider directly
    console.log('🔍 Test 1: Direct Gemini Provider test');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return;
    }

    const geminiProvider = new GeminiProvider({
      name: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-1.5-flash',
      enabled: true,
      priority: 1
    });

    // Check availability
    console.log('⏳ Checking Gemini availability...');
    const isAvailable = await geminiProvider.isAvailable();
    console.log(`🌐 Gemini available: ${isAvailable ? '✅' : '❌'}`);

    if (!isAvailable) {
      console.error('❌ Gemini is not available, skipping tests');
      return;
    }

    // Test 2: Create test image
    console.log('\n🔍 Test 2: Image analysis test');
    
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x99, 0xE6, 0x8C, 0x88, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);

    console.log('📄 Test image size:', testImageBuffer.length, 'bytes');

    // Test analysis in different languages
    const testCases = [
      { language: 'en', comment: 'Test burger image' },
      { language: 'ru', comment: 'Тестовое изображение бургера' },
      { language: 'es', comment: 'Imagen de prueba de hamburguesa' }
    ];

    for (const testCase of testCases) {
      console.log(`\n⏳ Testing ${testCase.language} analysis...`);
      
      try {
        const startTime = Date.now();
        const result = await geminiProvider.analyzeImage(
          testImageBuffer, 
          testCase.language, 
          testCase.comment
        );
        const duration = Date.now() - startTime;

        console.log(`✅ ${testCase.language} analysis completed in ${duration}ms`);
        console.log('📊 Result:', {
          name: result.name,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          confidence: result.confidence,
          provider: result.provider,
          language: result.language
        });
      } catch (error) {
        console.error(`❌ ${testCase.language} analysis failed:`, error.message);
      }
    }

    // Test 3: AI Provider Manager with multiple providers
    console.log('\n🔍 Test 3: AI Provider Manager test');
    
    const config = {
      activeProvider: 'gemini',
      
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
        enabled: !!process.env.OPENAI_API_KEY,
        priority: 2
      },
      
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-1.5-flash',
        enabled: true,
        priority: 1
      }
    };

    console.log('⏳ Initializing AI Provider Manager...');
    await AIProviderManager.initialize(config);

    console.log('🎯 Active provider:', AIProviderManager.getActiveProviderInfo());
    
    // Test provider switching
    if (process.env.OPENAI_API_KEY) {
      console.log('\n🔄 Testing provider switching...');
      
      // Test Gemini
      console.log('⏳ Testing with Gemini...');
      await AIProviderManager.setActiveProvider('gemini');
      let result = await AIProviderManager.analyzeImage(testImageBuffer, 'en', 'Test with Gemini');
      console.log('✅ Gemini result:', result.provider, '-', result.name);
      
      // Test OpenAI
      console.log('⏳ Testing with OpenAI...');
      await AIProviderManager.setActiveProvider('openai');
      result = await AIProviderManager.analyzeImage(testImageBuffer, 'en', 'Test with OpenAI');
      console.log('✅ OpenAI result:', result.provider, '-', result.name);
    }

    // Test 4: Providers status
    console.log('\n🔍 Test 4: Providers status');
    const providersStatus = await AIProviderManager.getProvidersStatus();
    console.log('📊 Providers status:', providersStatus);

    console.log('\n🎉 All Gemini tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cleanup
    AIProviderManager.shutdown();
  }
}

// Run tests
console.log('🚀 Starting Gemini AI Provider Tests');
console.log('🔑 Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('🔑 OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('📦 Node.js version:', process.version);
console.log('');

testGeminiProvider()
  .then(() => {
    console.log('\n✅ Test suite completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }); 