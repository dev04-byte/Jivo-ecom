const axios = require('axios');

async function testAPIWithCorrectedSchema() {
  // Test different ports to find the running server
  const ports = [5001, 5002, 5003];
  let workingPort = null;

  for (const port of ports) {
    try {
      console.log(`🔍 Testing server on port ${port}...`);
      await axios.get(`http://127.0.0.1:${port}/api/platforms`, { timeout: 2000 });
      console.log(`✅ Server found running on port ${port}`);
      workingPort = port;
      break;
    } catch (error) {
      console.log(`❌ Port ${port} not available`);
    }
  }

  if (!workingPort) {
    console.error('❌ No running server found on any port');
    return;
  }

  try {
    console.log('');
    console.log('🔍 Testing DealShare Import with corrected schema...');
    console.log('Expected to use: dealshare_po_header, dealshare_po_lines');

    // Test data for corrected schema
    const testData = {
      header: {
        po_number: 'API_CORRECTED_TEST_001',
        uploaded_by: 'api_test_user',
        total_items: 3,
        total_quantity: '45',
        total_gross_amount: '4500.00',
        comments: 'Testing corrected schema via API'
      },
      lines: [
        {
          line_number: 1,
          sku: 'API_SKU_001',
          product_name: 'API Test Product 1',
          quantity: 15,
          gross_amount: '1500.00'
        },
        {
          line_number: 2,
          sku: 'API_SKU_002',
          product_name: 'API Test Product 2',
          quantity: 15,
          gross_amount: '1500.00'
        },
        {
          line_number: 3,
          sku: 'API_SKU_003',
          product_name: 'API Test Product 3',
          quantity: 15,
          gross_amount: '1500.00'
        }
      ]
    };

    console.log(`📤 Sending import request to port ${workingPort}...`);
    console.log('Data:', JSON.stringify(testData, null, 2));

    const response = await axios.post(`http://127.0.0.1:${workingPort}/api/po/import/dealshare`, testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    console.log('✅ API import successful with corrected schema!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🎉 SUCCESS: API correctly imported into dealshare_po_lines!');

  } catch (error) {
    console.error('❌ API import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);

      // Check if it's still the table name error
      if (error.response.data && error.response.data.error &&
          error.response.data.error.includes('dealshare_po_items')) {
        console.error('');
        console.error('🔥 ISSUE IDENTIFIED: Server still using old schema with dealshare_po_items');
        console.error('💡 SOLUTION: Server needs restart to load corrected schema');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPIWithCorrectedSchema();