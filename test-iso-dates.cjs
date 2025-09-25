const axios = require('axios');

async function testWithISODates() {
  try {
    console.log('🔍 Testing DealShare Import with ISO date strings...');

    // Test data with problematic ISO date strings
    const testData = {
      header: {
        po_number: 'ISO_DATE_TEST_001',
        po_created_date: '2025-09-23T18:30:00.000Z',
        po_delivery_date: '2025-09-23T18:30:00.000Z',
        po_expiry_date: '2025-09-30T18:30:00.000Z',
        uploaded_by: 'test_user'
      },
      lines: []
    };

    console.log('📤 Sending ISO date import request...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ ISO date import successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ ISO date import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWithISODates();