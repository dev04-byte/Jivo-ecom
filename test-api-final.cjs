const axios = require('axios');

async function testAPIFinal() {
  try {
    console.log('🔍 Final API test with working tables...');

    const testData = {
      header: {
        po_number: 'API_FINAL_TEST_001',
        uploaded_by: 'api_final_test',
        total_items: 2,
        total_quantity: '30',
        total_gross_amount: '2800.00',
        comments: 'Final API test'
      },
      lines: [
        {
          line_number: 1,
          sku: 'FINAL_SKU_001',
          product_name: 'Final Test Product 1',
          quantity: 15,
          gross_amount: '1400.00'
        },
        {
          line_number: 2,
          sku: 'FINAL_SKU_002',
          product_name: 'Final Test Product 2',
          quantity: 15,
          gross_amount: '1400.00'
        }
      ]
    };

    console.log('📤 Sending final API import test...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    console.log('✅ Final API import successful!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🎉 SUCCESS: API import is now working!');

  } catch (error) {
    console.error('❌ Final API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPIFinal();