const fs = require('fs');
const FormData = require('form-data');
const { Readable } = require('stream');

async function testSingleFile() {
  console.log('🧪 Testing single Blinkit file upload...');

  const testFile = 'C:\\Users\\singh\\Downloads\\blinkit.xlsx';

  if (!fs.existsSync(testFile)) {
    console.log(`⚠️ Test file not found: ${testFile}`);
    return;
  }

  try {
    const fileBuffer = fs.readFileSync(testFile);
    console.log(`📏 File size: ${fileBuffer.length} bytes`);

    const form = new FormData();

    // Create a stream from the buffer
    const stream = Readable.from(fileBuffer);

    form.append('file', stream, {
      filename: 'blinkit.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      knownLength: fileBuffer.length
    });

    console.log('📡 Sending request to server...');

    const response = await fetch('http://localhost:5000/api/blinkit-po/upload', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });

    console.log(`📡 Response status: ${response.status}`);

    const result = await response.text(); // Get as text first
    console.log(`📄 Raw response (first 500 chars): ${result.substring(0, 500)}${result.length > 500 ? '...' : ''}`);

    try {
      const jsonResult = JSON.parse(result);

      if (response.ok) {
        console.log('✅ Upload successful!');
        console.log(`📊 PO Details:`, {
          message: jsonResult.message,
          po_number: jsonResult.po?.po_number || 'N/A',
          vendor_name: jsonResult.po?.vendor_name || 'N/A',
          buyer_name: jsonResult.po?.buyer_name || 'N/A',
          total_items: jsonResult.totalItems || 0,
          parsing_method: jsonResult.parsing_method || 'unknown'
        });
      } else {
        console.log('❌ Upload failed:');
        console.log(`Error: ${jsonResult.error || 'No error message'}`);
        console.log(`Details: ${jsonResult.details || 'No details'}`);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response:', parseError.message);
      console.log('📄 Full response:', result);
    }

  } catch (error) {
    console.log(`❌ Error testing file:`, error.message);
    console.log('🔍 Full error:', error);
  }
}

// Run test
testSingleFile()
  .then(() => console.log('🎉 Test completed!'))
  .catch(error => console.error('💥 Test failed:', error));