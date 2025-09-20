const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testWithAxios() {
  console.log('🧪 Testing Blinkit upload with axios...');

  const testFile = 'C:\\Users\\singh\\Downloads\\blinkit.xlsx';

  if (!fs.existsSync(testFile)) {
    console.log(`⚠️ Test file not found: ${testFile}`);
    return;
  }

  try {
    const form = new FormData();

    // Create a file stream directly
    const fileStream = fs.createReadStream(testFile);

    form.append('file', fileStream, {
      filename: 'blinkit.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('📡 Sending request with axios...');

    const response = await axios.post('http://localhost:5000/api/blinkit-po/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    });

    console.log(`📡 Response status: ${response.status}`);
    console.log('✅ Upload successful!');

    const result = response.data;
    console.log(`📊 PO Details:`, {
      message: result.message,
      po_number: result.po?.po_number || 'N/A',
      vendor_name: result.po?.vendor_name || 'N/A',
      buyer_name: result.po?.buyer_name || 'N/A',
      total_items: result.totalItems || 0,
      parsing_method: result.parsing_method || 'unknown'
    });

  } catch (error) {
    console.log('❌ Upload failed:', error.message);

    if (error.response) {
      console.log(`📡 Response status: ${error.response.status}`);
      console.log(`📄 Response data:`, error.response.data);
    } else if (error.request) {
      console.log('📡 No response received:', error.request);
    } else {
      console.log('🔍 Error details:', error);
    }
  }
}

// Check if axios is available, install if needed
try {
  require('axios');
} catch (e) {
  console.log('❌ Axios not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit' });
}

// Run test
testWithAxios()
  .then(() => console.log('🎉 Axios test completed!'))
  .catch(error => console.error('💥 Axios test failed:', error));