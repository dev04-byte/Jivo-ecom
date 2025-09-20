import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const testFiles = [
  'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FBHWN06900132.xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FJSWG06907554.xls'
];

console.log('🔍 Testing Flipkart Excel integration...\n');

async function testFlipkartParsing() {
  // First, check if server is running
  try {
    const serverCheck = await fetch('http://localhost:8000/health');
    if (!serverCheck.ok) {
      console.error('❌ Server is not running. Please start the server first with: npm start');
      return;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first with: npm start');
    return;
  }

  console.log('✅ Server is running, proceeding with tests...\n');

  for (let i = 0; i < testFiles.length; i++) {
    const filePath = testFiles[i];
    console.log(`📄 Testing File ${i + 1}: ${filePath.split('\\').pop()}`);
    console.log('=' .repeat(50));

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log('⚠️  File not found, skipping...');
        continue;
      }

      // Create form data
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('platform', 'flipkart');

      // Test preview endpoint
      console.log('🔍 Testing preview endpoint...');
      const previewResponse = await fetch('http://localhost:8000/api/po/preview', {
        method: 'POST',
        body: form
      });

      if (previewResponse.ok) {
        const result = await previewResponse.json();
        console.log('✅ Preview successful!');
        console.log('📋 PO Number:', result.header?.po_number || 'N/A');
        console.log('🏢 Supplier:', result.header?.supplier_name || 'N/A');
        console.log('📦 Line items:', result.lines?.length || 0);
        console.log('🔢 Total Quantity:', result.totalQuantity || 0);
        console.log('💰 Total Amount:', result.totalAmount || 'N/A');
      } else {
        const error = await previewResponse.text();
        console.error('❌ Preview failed:', error);
      }

    } catch (error) {
      console.error(`❌ Error testing ${filePath.split('\\').pop()}:`, error.message);
    }

    console.log(''); // Empty line between tests
  }
}

testFlipkartParsing().catch(console.error);