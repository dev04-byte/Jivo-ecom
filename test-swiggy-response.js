import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testSwiggyResponse() {
  console.log('🧪 Testing Swiggy CSV response structure...');

  const file = {
    name: 'Working file (PCHPO141863.csv)',
    path: 'c:\\Users\\singh\\Downloads\\PCHPO141863.csv'
  };

  try {
    console.log(`\n📂 Testing ${file.name}`);

    if (!fs.existsSync(file.path)) {
      console.log(`❌ File not found: ${file.path}`);
      return;
    }

    // Test preview endpoint
    console.log('📋 Testing preview endpoint...');

    const csvBuffer = fs.readFileSync(file.path);
    const formData = new FormData();
    formData.append('file', csvBuffer, {
      filename: file.path.split('\\').pop(),
      contentType: 'text/csv'
    });

    const previewResponse = await fetch('http://localhost:5000/api/swiggy-pos/preview', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`📤 Preview response status: ${previewResponse.status}`);

    const responseText = await previewResponse.text();
    console.log('📄 Raw response (first 1000 chars):', responseText.substring(0, 1000));

    try {
      const previewResult = JSON.parse(responseText);
      console.log('✅ JSON parsed successfully!');
      console.log('📊 Response structure:', Object.keys(previewResult));

      if (previewResult.data) {
        console.log('📊 Data structure:', Object.keys(previewResult.data));
        if (previewResult.data.poList) {
          console.log(`📋 Found ${previewResult.data.poList.length} POs`);
        }
      } else {
        console.log('📊 Full response:', JSON.stringify(previewResult, null, 2));
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON response');
      console.error('💥 Parse error:', parseError.message);
    }

  } catch (error) {
    console.error(`❌ Error testing ${file.name}:`, error.message);
    console.error('Stack:', error.stack);
  }
}

testSwiggyResponse().catch(console.error);