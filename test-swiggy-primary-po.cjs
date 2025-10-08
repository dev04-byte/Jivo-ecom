const fs = require('fs');
const fetch = require('node-fetch').default;

// Create a sample Swiggy Primary PO CSV file for testing using the actual format
const csvContent = `PoNumber,Entity,FacilityId,FacilityName,City,PoCreatedAt,PoModifiedAt,Status,SupplierCode,VendorName,PoAmount,SkuCode,SkuDescription,CategoryId,OrderedQty,ReceivedQty,BalancedQty,Tax,PoLineValueWithoutTax,PoLineValueWithTax,Mrp,UnitBasedCost,ExpectedDeliveryDate,PoExpiryDate,OtbReferenceNumber,InternalExternalPo,PoAgeing,BrandName,ReferencePoNumber
CPDPO189177,SCOOTSY LOGISTICS PRIVATE LIMITED,CPD,PUN Delhivery,PUNE,2025-09-27 02:26:29,2025-09-27 02:26:30,CONFIRMED,85235374,CHIRAG ENTERPRISES,214530.00,15686,Jivo Canola Cold Press Oil Indian Medical Association Recommended 5.0 ltr,"Edible Oils and Ghee, Edible Oils",6,0,6,378.00,7560.00,7938.00,1650.00,1260.00,2025-10-11,2025-10-14,2025_09_26_PUNE_PUN DELHIVERY,external,0,Jivo,
CPDPO189177,SCOOTSY LOGISTICS PRIVATE LIMITED,CPD,PUN Delhivery,PUNE,2025-09-27 02:26:29,2025-09-27 02:26:30,CONFIRMED,85235374,CHIRAG ENTERPRISES,214530.00,15687,Jivo Extra Light Daily Cooking Olive Oil 1.0 ltr,"Edible Oils and Ghee, Olive Oil",32,0,32,807.62,16152.38,16960.00,1499.00,504.76,2025-10-11,2025-10-14,2025_09_26_PUNE_PUN DELHIVERY,external,0,Jivo,
CPDPO189177,SCOOTSY LOGISTICS PRIVATE LIMITED,CPD,PUN Delhivery,PUNE,2025-09-27 02:26:29,2025-09-27 02:26:30,CONFIRMED,85235374,CHIRAG ENTERPRISES,214530.00,390730,Jivo Cold Pressed oil Groundnut Oil 1.0 ltr,"Edible Oils and Ghee, Edible Oils",80,0,80,761.91,15238.09,16000.00,560.00,190.48,2025-10-11,2025-10-14,2025_09_26_PUNE_PUN DELHIVERY,external,0,Jivo,`;

// Save the test CSV file
fs.writeFileSync('test-swiggy-primary-po.csv', csvContent);
console.log('✅ Created test-swiggy-primary-po.csv');

// Test the upload via API
async function testUpload() {
  const FormData = require('form-data');

  const form = new FormData();
  form.append('file', fs.createReadStream('test-swiggy-primary-po.csv'));

  try {
    // Test preview endpoint first
    console.log('📋 Testing preview endpoint...');
    const previewResponse = await fetch('http://localhost:5001/api/swiggy-pos/preview', {
      method: 'POST',
      body: form
    });

    if (previewResponse.ok) {
      const previewData = await previewResponse.json();
      console.log('✅ Preview successful!');
      console.log('Header:', JSON.stringify(previewData.header, null, 2));
      console.log('Total lines:', previewData.lines.length);
      console.log('First line:', JSON.stringify(previewData.lines[0], null, 2));
    } else {
      const error = await previewResponse.text();
      console.error('❌ Preview failed:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:5001/api/health')
  .then(() => {
    console.log('✅ Server is running');
    testUpload();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start the server first with: npm run dev');
  });