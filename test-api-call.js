import fs from 'fs';

// Test the actual API endpoint
async function testSwiggyAPI() {
  try {
    console.log('🔄 Testing Swiggy API endpoint...');

    // Read the CSV file
    const csvPath = 'C:\\Users\\singh\\Downloads\\PO_1758265329897.csv';
    const csvBuffer = fs.readFileSync(csvPath);

    console.log(`📄 File size: ${csvBuffer.length} bytes`);

    // Create FormData
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('file', csvBuffer, {
      filename: 'PO_1758265329897.csv',
      contentType: 'text/csv'
    });
    formData.append('platform', 'swiggy');

    console.log('📤 Sending request to /api/po/preview...');

    // Make the API call
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://127.0.0.1:5000/api/po/preview', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response status text: ${response.statusText}`);

    const responseText = await response.text();
    console.log(`📥 Response body: ${responseText}`);

    if (!response.ok) {
      console.error('❌ API call failed');
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Response is not valid JSON');
      }
    } else {
      console.log('✅ API call successful');
      try {
        const data = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('Response is not valid JSON');
      }
    }

  } catch (error) {
    console.error('❌ API test failed:', error);
    console.error('Error details:', error.message);
  }
}

testSwiggyAPI();