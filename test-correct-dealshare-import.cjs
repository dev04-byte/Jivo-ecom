const axios = require('axios');

async function testCorrectDealshareImport() {
  try {
    console.log('🔍 Testing DealShare Import with correct table names...');
    console.log('Expected tables: dealshare_po_header, dealshare_po_lines');

    // Test data with complete structure
    const testData = {
      header: {
        po_number: 'CORRECT_TABLE_TEST_001',
        uploaded_by: 'test_user',
        total_items: 2,
        total_quantity: '35',
        total_gross_amount: '2750.00',
        comments: 'Testing correct table names'
      },
      lines: [
        {
          line_number: 1,
          sku: 'CORRECT_SKU_001',
          product_name: 'Corrected Test Product 1',
          quantity: 20,
          gross_amount: '1500.00'
        },
        {
          line_number: 2,
          sku: 'CORRECT_SKU_002',
          product_name: 'Corrected Test Product 2',
          quantity: 15,
          gross_amount: '1250.00'
        }
      ]
    };

    console.log('📤 Sending import request to dealshare_po_header and dealshare_po_lines tables...');
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('✅ Import successful with correct table names!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🎉 SUCCESS: Data imported into correct tables:');
    console.log('  📋 dealshare_po_header - Header record created');
    console.log('  📋 dealshare_po_lines - Line items created');

  } catch (error) {
    console.error('❌ Import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCorrectDealshareImport();