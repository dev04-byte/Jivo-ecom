const axios = require('axios');

async function testBasicRoute() {
  try {
    console.log('🔍 Testing basic route access...');

    const response = await axios.get('http://127.0.0.1:5001/api/platforms');
    console.log('✅ Platform route works:', response.status);

    // Now test dealshare route with basic data
    const basicData = {
      header: { po_number: 'BASIC_001', uploaded_by: 'test' },
      lines: []
    };

    console.log('🔍 Testing POST route...');

    const postResponse = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', basicData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });

    console.log('✅ POST route works:', postResponse.status);

  } catch (error) {
    console.error('❌ Route test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testBasicRoute();