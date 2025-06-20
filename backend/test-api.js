const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing SnapCal API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        language: 'en'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Registration successful:', registerData.data.user.name);
      const token = registerData.data.token;
      
      // Test getting user profile
      console.log('\n3. Testing get user profile...');
      const profileResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const profileData = await profileResponse.json();
      if (profileResponse.ok) {
        console.log('✅ Profile retrieved:', profileData.data.user.name);
      } else {
        console.log('❌ Profile retrieval failed:', profileData);
      }

      // Test creating a meal
      console.log('\n4. Testing meal creation...');
      const mealResponse = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Meal',
          calories: 300,
          protein: 15,
          carbs: 30,
          fat: 10,
          comment: 'Test meal for API testing'
        })
      });
      
      const mealData = await mealResponse.json();
      if (mealResponse.ok) {
        console.log('✅ Meal created:', mealData.data.name);
        
        // Test getting meals
        console.log('\n5. Testing get meals...');
        const mealsResponse = await fetch(`${API_BASE}/meals`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        const mealsData = await mealsResponse.json();
        if (mealsResponse.ok) {
          console.log('✅ Meals retrieved:', mealsData.data.length, 'meals');
        } else {
          console.log('❌ Meals retrieval failed:', mealsData);
        }
      } else {
        console.log('❌ Meal creation failed:', mealData);
      }

      // Test AI analysis (mock)
      console.log('\n6. Testing AI analysis...');
      const aiResponse = await fetch(`${API_BASE}/ai/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const aiData = await aiResponse.json();
      if (aiResponse.ok) {
        console.log('✅ AI service status:', aiData.data.status);
      } else {
        console.log('❌ AI service check failed:', aiData);
      }

    } else {
      console.log('❌ Registration failed:', registerData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

// Run the test
testAPI(); 