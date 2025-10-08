const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testSwiggyAPI() {
  try {
    console.log('🧪 Testing Swiggy API with real CSV...');

    // Create form data with the CSV file
    const form = new FormData();
    form.append('file', fs.createReadStream('./test-swiggy-primary-po.csv'));

    console.log('📤 Step 1: Testing preview endpoint...');

    // Test preview first
    const previewResponse = await axios.post('http://127.0.0.1:5001/api/swiggy-pos/preview', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Preview successful!');
    console.log('📊 Preview data structure:', {
      hasHeader: !!previewResponse.data.header,
      hasLines: !!previewResponse.data.lines,
      linesCount: previewResponse.data.lines ? previewResponse.data.lines.length : 0,
      poNumber: previewResponse.data.header ? previewResponse.data.header.po_number : 'N/A',
      grandTotal: previewResponse.data.header ? previewResponse.data.header.grand_total : 'N/A',
      totalAmount: previewResponse.data.header ? previewResponse.data.header.total_amount : 'N/A'
    });

    console.log('📤 Step 2: Testing database import...');

    // Test the import API
    const importResponse = await axios.post('http://127.0.0.1:5001/api/swiggy-pos', {
      header: previewResponse.data.header,
      lines: previewResponse.data.lines
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Import successful!');
    console.log('📥 Import response:', importResponse.data);

  } catch (error) {
    console.error('❌ API test failed:', {
      message: error.message,
      status: error.response ? error.response.status : 'No status',
      data: error.response ? error.response.data : 'No response data'
    });
    if (error.response && error.response.data) {
      console.error('❌ Server response:', error.response.data);
    }
  }
}

// Run the test
testSwiggyAPI();