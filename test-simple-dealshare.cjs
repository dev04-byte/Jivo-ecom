const axios = require('axios');

async function testSimpleDealShare() {
  try {
    console.log('🔍 Testing MINIMAL DealShare Import...');

    // Minimal test data with only required fields
    const minimalData = {
      header: {
        po_number: 'MINIMAL_TEST_001',
        uploaded_by: 'test_user'
      },
      lines: []
    };

    console.log('📤 Sending minimal import request...');
    console.log('Data:', JSON.stringify(minimalData, null, 2));

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', minimalData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ Minimal import successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Minimal import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSimpleDealShare();