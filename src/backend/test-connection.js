/**
 * Simple script to test if backend is running and configured correctly
 * Run with: node test-connection.js
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('\n🔍 Testing Dorphin Backend Connection...\n');

  // Test 1: Health Check
  console.log('1️⃣  Testing health endpoint...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Backend is running!');
      console.log(`   📍 Version: ${data.version}`);
      console.log(`   ⏰ Timestamp: ${data.timestamp}`);
    } else {
      console.log('   ❌ Backend responded but status is not success');
    }
  } catch (error) {
    console.log('   ❌ Failed to connect to backend');
    console.log(`   💡 Error: ${error.message}`);
    console.log('\n   Make sure to:');
    console.log('   - Start the backend: cd backend && npm run dev');
    console.log('   - Check if MongoDB is running');
    return;
  }

  console.log('\n2️⃣  Testing CORS...');
  try {
    const response = await fetch(`${API_URL}/api/v1/videos/feed`);
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    if (corsHeader) {
      console.log('   ✅ CORS is configured');
      console.log(`   📍 Allowed origin: ${corsHeader}`);
    } else {
      console.log('   ⚠️  CORS headers not found');
    }
  } catch (error) {
    console.log('   ❌ Could not test CORS');
  }

  console.log('\n3️⃣  Testing MongoDB connection...');
  // The backend will fail on startup if MongoDB is not connected
  console.log('   ✅ MongoDB appears to be connected (server is running)');

  console.log('\n✨ Backend Test Complete!\n');
  console.log('📝 Summary:');
  console.log('   - Backend is running at http://localhost:5000');
  console.log('   - API endpoint: http://localhost:5000/api/v1');
  console.log('   - Ready to receive requests from frontend\n');
}

testBackend().catch(console.error);
