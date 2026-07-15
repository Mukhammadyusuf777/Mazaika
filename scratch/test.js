const axios = require('axios');

async function testBackend() {
  const baseURL = 'http://localhost:3000';
  
  console.log('1. Testing Registration...');
  let user;
  try {
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'password123'
    });
    console.log('Registration success:', regRes.data.success);
    user = regRes.data.user;
  } catch (e) {
    console.error('Registration failed:', e.response?.data || e.message);
    return;
  }

  console.log('\n2. Testing Login...');
  try {
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: user.email,
      password: 'password123'
    });
    console.log('Login success:', loginRes.data.success);
  } catch (e) {
    console.error('Login failed:', e.response?.data || e.message);
  }

  console.log('\n3. Testing Bot Creation...');
  let bot;
  try {
    const botRes = await axios.post(`${baseURL}/bots`, {
      name: 'Test Bot',
      token: '12345:INVALID_TOKEN',
      userId: user.id
    });
    console.log('Bot created with ID:', botRes.data.id);
    bot = botRes.data;
  } catch (e) {
    console.error('Bot creation failed:', e.response?.data || e.message);
    return;
  }

  console.log('\n4. Testing Fetch Bots...');
  try {
    const fetchRes = await axios.get(`${baseURL}/bots/user/${user.id}`);
    console.log(`Found ${fetchRes.data.length} bots for user.`);
  } catch (e) {
    console.error('Fetch bots failed:', e.response?.data || e.message);
  }

  console.log('\n5. Testing Bot Start (Should fail gracefully due to invalid token)...');
  try {
    const startRes = await axios.post(`${baseURL}/bots/${bot.id}/start`);
    console.log('Start response:', startRes.data);
  } catch (e) {
    console.error('Start bot failed:', e.response?.data || e.message);
  }
}

testBackend();
