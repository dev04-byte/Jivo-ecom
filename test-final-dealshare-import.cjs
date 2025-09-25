const axios = require('axios');

async function testFinalDealshareImport() {
  try {
    console.log('🔍 Final DealShare Import Test with Real Data...');

    // Test data with only required fields - no ISO dates to avoid conversion issues
    const testData = {
      header: {
        po_number: 'FINAL_TEST_001',
        uploaded_by: 'test_user',
        total_items: 2,
        total_quantity: '30',
        total_gross_amount: '2500.00'
      },
      lines: [
        {
          line_number: 1,
          sku: 'TEST_SKU_001',
          product_name: 'Test Product 1',
          quantity: 15,
          gross_amount: '1200.00'
        },
        {
          line_number: 2,
          sku: 'TEST_SKU_002',
          product_name: 'Test Product 2',
          quantity: 15,
          gross_amount: '1300.00'
        }
      ]
    };

    console.log('📤 Sending final import request...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ Final import test successful!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🎉 SUCCESS: Data successfully imported into dealshare_po_header and dealshare_po_items tables!');

  } catch (error) {
    console.error('❌ Final import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFinalDealshareImport();