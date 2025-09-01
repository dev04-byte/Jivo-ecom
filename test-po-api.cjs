const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testPoCreationAPI() {
  console.log('🧪 Testing PO Creation API...');
  
  try {
    // Create test data
    const testPoData = {
      master: {
        vendor_po_number: 'TEST-' + Date.now(),
        platform_id: 1,
        distributor_id: 9, // Use valid distributor ID (BABA LOKNATH)
        state_id: 1,
        district_id: 1,
        region: 'NORTH INDIA',
        area: 'Test Area',
        po_date: new Date().toISOString().split('T')[0],
        dispatch_from: 'MAYAPURI',
        status_id: 1
      },
      lines: [
        {
          platform_product_code_id: 'TEST001',
          sap_id: 'SAP001',
          item_name: 'Test Item 1',
          quantity: 10,
          basic_amount: 100.00,
          tax: 18.00,
          landing_amount: 118.00,
          total_amount: 118.00,
          total_liter: 10.00,
          status: 1
        }
      ]
    };

    // Create a test file
    const testFilePath = path.join(__dirname, 'test-attachment.txt');
    fs.writeFileSync(testFilePath, 'This is a test attachment file for PO creation API testing.');

    // Create FormData
    const formData = new FormData();
    
    // Add the test file
    formData.append('attachment', fs.createReadStream(testFilePath), {
      filename: 'test-attachment.txt',
      contentType: 'text/plain'
    });
    
    // Add PO data as JSON string
    formData.append('poData', JSON.stringify(testPoData));

    console.log('📤 Sending request to API...');
    console.log('PO Data:', JSON.stringify(testPoData, null, 2));

    // Send request to the API
    const response = await fetch('http://127.0.0.1:8001/api/pos', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header, let form-data set it with boundary
        ...formData.getHeaders()
      }
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);

    if (response.ok) {
      console.log('✅ API Test PASSED - PO created successfully!');
      try {
        const responseData = JSON.parse(responseText);
        console.log('🎉 Created PO ID:', responseData.id);
      } catch (e) {
        console.log('📝 Response was text, not JSON');
      }
    } else {
      console.log('❌ API Test FAILED');
      console.log('Error Details:', responseText);
    }

    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('🧹 Cleaned up test file');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPoCreationAPI();