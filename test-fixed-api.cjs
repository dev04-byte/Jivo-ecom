const axios = require('axios');

async function testFixedAPI() {
  try {
    console.log('🔍 Testing FIXED API import after creating missing tables...');

    const testData = {
      header: {
        po_number: 'FIXED_API_TEST_001',
        uploaded_by: 'fixed_api_test',
        total_items: 2,
        total_quantity: '40',
        total_gross_amount: '3200.00',
        comments: 'Testing after fixing distributor_mst table'
      },
      lines: [
        {
          line_number: 1,
          sku: 'FIXED_SKU_001',
          product_name: 'Fixed Test Product 1',
          quantity: 20,
          gross_amount: '1600.00'
        },
        {
          line_number: 2,
          sku: 'FIXED_SKU_002',
          product_name: 'Fixed Test Product 2',
          quantity: 20,
          gross_amount: '1600.00'
        }
      ]
    };

    console.log('📤 Sending fixed API import test to port 5004...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5004/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    console.log('✅ Fixed API import successful!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🎉 SUCCESS: API should now ACTUALLY insert data!');

  } catch (error) {
    console.error('❌ Fixed API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFixedAPI();