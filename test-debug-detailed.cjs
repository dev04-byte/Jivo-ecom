const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function detailedDebugTest() {
  try {
    console.log('🔍 Detailed debug test...');

    // Create form data with the CSV file
    const form = new FormData();
    form.append('file', fs.createReadStream('./test-swiggy-primary-po.csv'));

    // Test preview first to get the exact data structure
    const previewResponse = await axios.post('http://127.0.0.1:5001/api/swiggy-pos/preview', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('📊 Full header data:', JSON.stringify(previewResponse.data.header, null, 2));
    console.log('📋 Sample line data:', JSON.stringify(previewResponse.data.lines[0], null, 2));

    // Test with minimal data first
    console.log('🧪 Testing with minimal PO data...');

    const minimalData = {
      header: {
        po_number: 'TEST123',
        po_date: new Date(),
        vendor_name: 'Test Vendor',
        grand_total: 100,
        total_items: 1,
        total_quantity: 1,
        status: 'pending',
        created_by: 'test'
      },
      lines: [
        {
          line_number: 1,
          item_code: 'TEST001',
          item_description: 'Test Item',
          quantity: 1,
          unit_base_cost: 100,
          line_total: 100
        }
      ]
    };

    try {
      const minimalResponse = await axios.post('http://127.0.0.1:5001/api/swiggy-pos', minimalData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Minimal test successful!');
    } catch (minimalError) {
      console.error('❌ Minimal test failed:', {
        status: minimalError.response ? minimalError.response.status : 'No status',
        data: minimalError.response ? minimalError.response.data : 'No response data'
      });
    }

    // Now test with the real data
    console.log('🧪 Testing with real CSV data...');

    try {
      const importResponse = await axios.post('http://127.0.0.1:5001/api/swiggy-pos', {
        header: previewResponse.data.header,
        lines: previewResponse.data.lines
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Real data test successful!');
    } catch (realError) {
      console.error('❌ Real data test failed:', {
        status: realError.response ? realError.response.status : 'No status',
        data: realError.response ? realError.response.data : 'No response data'
      });
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Run the test
detailedDebugTest();