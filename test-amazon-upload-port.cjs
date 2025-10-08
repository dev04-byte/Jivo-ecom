const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

async function testAmazonUploadOnPort(port) {
  try {
    console.log(`\n🧪 Testing Amazon PO Upload on port ${port}...`);

    const form = new FormData();

    // Check if file exists
    const filePath = 'c:\\Users\\singh\\Downloads\\664155NW po.xlsx';
    if (!fs.existsSync(filePath)) {
      console.error('❌ Excel file not found:', filePath);
      return;
    }

    console.log('📂 Found Excel file:', filePath);

    form.append('file', fs.createReadStream(filePath));
    form.append('platform', 'amazon');
    form.append('uploadedBy', 'test-user');

    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: '/api/pos/preview',
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      }
    };

    console.log(`🚀 Sending request to port ${port}...`);

    const req = http.request(options, (res) => {
      let data = '';

      console.log('📡 Response status:', res.statusCode);
      console.log('📡 Response headers:', res.headers);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            const response = JSON.parse(data);

            console.log(`\n✅ Amazon PO Upload Test Results (Port ${port}):`);
            console.log('=====================================');

            if (response.success && response.data) {
              console.log('🎉 Upload Successful!');
              console.log('- PO Number:', response.data.header?.po_number);
              console.log('- Currency:', response.data.header?.currency);
              console.log('- Total Items:', response.data.totalItems);
              console.log('- Detected Vendor:', response.data.detectedVendor);
            } else {
              console.log('❌ Upload Failed:', response.message);
            }

          } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError.message);
            console.log('Raw response (first 200 chars):', data.substring(0, 200));
          }
        } else {
          console.log(`❌ Port ${port}: Received HTML instead of JSON`);
          console.log('Response content-type:', res.headers['content-type']);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Port ${port} request error:`, error.message);
    });

    form.pipe(req);

  } catch (error) {
    console.error(`❌ Port ${port} test error:`, error);
  }
}

// Test both common ports
async function runTests() {
  await testAmazonUploadOnPort(5000);

  // Wait a bit before testing next port
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testAmazonUploadOnPort(5001);

  // Also test if there's anything on 3000 (common dev port)
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testAmazonUploadOnPort(3000);
}

runTests();