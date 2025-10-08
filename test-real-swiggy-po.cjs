const fs = require('fs');
const fetch = require('node-fetch').default;

// Test the actual Swiggy CSV file upload
async function testRealSwiggyUpload() {
  const FormData = require('form-data');

  const form = new FormData();
  form.append('file', fs.createReadStream('C:\\Users\\singh\\Downloads\\SWIGGY1758952908646.csv'));

  try {
    console.log('📋 Testing real Swiggy CSV preview...');
    const previewResponse = await fetch('http://localhost:5001/api/swiggy-pos/preview', {
      method: 'POST',
      body: form
    });

    if (previewResponse.ok) {
      const previewData = await previewResponse.json();
      console.log('✅ Real Swiggy CSV Preview successful!');
      console.log('PO Number:', previewData.header.PoNumber);
      console.log('Vendor:', previewData.header.VendorName);
      console.log('Total Items:', previewData.header.total_items);
      console.log('Total Amount:', previewData.header.total_amount);
      console.log('Sample line item:');
      console.log('  SKU:', previewData.lines[0].SkuCode);
      console.log('  Description:', previewData.lines[0].SkuDescription);
      console.log('  Quantity:', previewData.lines[0].OrderedQty);
      console.log('  Unit Cost:', previewData.lines[0].UnitBasedCost);
      console.log('  Tax:', previewData.lines[0].Tax);
      console.log('  Total:', previewData.lines[0].PoLineValueWithTax);
    } else {
      const error = await previewResponse.text();
      console.error('❌ Real Swiggy CSV Preview failed:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if server is running and test
fetch('http://localhost:5001/api/health')
  .then(() => {
    console.log('✅ Server is running');
    testRealSwiggyUpload();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start the server first with: npm run dev');
  });