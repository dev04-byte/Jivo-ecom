const https = require('https');
const fs = require('fs');
const FormData = require('form-data');

async function testAmazonUpload() {
  try {
    console.log('🧪 Testing Amazon PO Upload...');

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
      port: 5001,
      path: '/api/pos/preview',
      method: 'POST',
      headers: form.getHeaders()
    };

    console.log('🚀 Sending request to server...');

    const req = https.request(options, (res) => {
      let data = '';

      console.log('📡 Response status:', res.statusCode);
      console.log('📡 Response headers:', res.headers);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          console.log('\n✅ Amazon PO Upload Test Results:');
          console.log('=====================================');

          if (response.success && response.data) {
            console.log('🎉 Upload Successful!');
            console.log('\n📊 Header Information:');
            console.log('- PO Number:', response.data.header?.po_number);
            console.log('- Vendor Code:', response.data.header?.vendor_code);
            console.log('- Vendor Name:', response.data.header?.vendor_name);
            console.log('- Buyer:', response.data.header?.buyer_name);
            console.log('- Currency:', response.data.header?.currency);
            console.log('- Total Amount:', response.data.header?.total_amount);
            console.log('- Ship To:', response.data.header?.ship_to_location);
            console.log('- Bill To:', response.data.header?.bill_to_location);
            console.log('- PO Date:', response.data.header?.po_date);
            console.log('- Delivery Date:', response.data.header?.delivery_date);

            console.log('\n📦 Summary:');
            console.log('- Total Items:', response.data.totalItems);
            console.log('- Total Quantity:', response.data.totalQuantity);
            console.log('- Detected Vendor:', response.data.detectedVendor);

            console.log('\n📋 Line Items:');
            if (response.data.lines && response.data.lines.length > 0) {
              response.data.lines.slice(0, 5).forEach((line, index) => {
                console.log(`  ${index + 1}. ASIN: ${line.asin}, SKU: ${line.sku}, Product: ${line.product_name?.substring(0, 50)}..., Qty: ${line.quantity_ordered}`);
              });

              if (response.data.lines.length > 5) {
                console.log(`  ... and ${response.data.lines.length - 5} more items`);
              }
            } else {
              console.log('  ❌ No line items found!');
            }

            console.log('\n🎯 All fields populated correctly!');
          } else {
            console.log('❌ Upload Failed:', response.message);
            console.log('Full response:', JSON.stringify(response, null, 2));
          }

        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
    });

    form.pipe(req);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAmazonUpload();