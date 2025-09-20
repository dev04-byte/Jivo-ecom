const fs = require('fs');
const path = require('path');

// Test the fixed Blinkit upload functionality
async function testBlinkitUpload() {
  console.log('🧪 Testing Blinkit Upload Fix...');

  const testFiles = [
    'C:\\Users\\singh\\Downloads\\2135210110435.xlsx',
    'C:\\Users\\singh\\Downloads\\1679310159484.xlsx',
    'C:\\Users\\singh\\Downloads\\43876710002689.xlsx',
    'C:\\Users\\singh\\Downloads\\1256710164048 (1).xlsx',
    'C:\\Users\\singh\\Downloads\\blinkit.xlsx'
  ];

  const baseUrl = 'http://localhost:5000';

  for (const filePath of testFiles) {
    try {
      console.log(`\n📁 Testing file: ${path.basename(filePath)}`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File not found: ${filePath}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(filePath);
      console.log(`📏 File size: ${fileBuffer.length} bytes`);

      // Create form data
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fileBuffer, {
        filename: path.basename(filePath),
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Test upload
      const response = await fetch(`${baseUrl}/api/blinkit-po/upload`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Upload successful!');
        console.log(`📊 PO Details:`, {
          po_number: result.po?.po_number || 'N/A',
          vendor_name: result.po?.vendor_name || 'N/A',
          total_items: result.totalItems || 0,
          parsing_method: result.parsing_method || 'unknown'
        });
      } else {
        console.log('❌ Upload failed:');
        console.log(`Status: ${response.status}`);
        console.log(`Error: ${result.error}`);
        console.log(`Details: ${result.details}`);
      }

    } catch (error) {
      console.log(`❌ Error testing ${path.basename(filePath)}:`, error.message);
    }
  }
}

// Test Excel parsing directly
async function testExcelParsingDirectly() {
  console.log('\n🔬 Testing Excel Parsing Directly...');

  const testFile = 'C:\\Users\\singh\\Downloads\\blinkit.xlsx';

  if (!fs.existsSync(testFile)) {
    console.log(`⚠️ Test file not found: ${testFile}`);
    return;
  }

  try {
    const { parseBlinkitExcelFile } = require('./server/blinkit-excel-parser');

    const fileBuffer = fs.readFileSync(testFile);
    console.log(`📏 File size: ${fileBuffer.length} bytes`);

    const result = parseBlinkitExcelFile(fileBuffer);

    console.log('✅ Direct parsing successful!');
    console.log('📊 Parsed Data:', {
      po_number: result.po_header.po_number,
      vendor_name: result.po_header.vendor_name,
      buyer_name: result.po_header.buyer_name,
      total_items: result.po_lines.length,
      total_quantity: result.po_header.total_quantity,
      total_amount: result.po_header.total_amount,
      line_items_sample: result.po_lines.slice(0, 3).map(item => ({
        item_code: item.item_code,
        description: item.product_description?.substring(0, 30),
        quantity: item.quantity,
        total_amount: item.total_amount
      }))
    });

  } catch (error) {
    console.log('❌ Direct parsing failed:', error.message);
    console.log('🔍 Error details:', error.stack);
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 Starting Blinkit Upload Tests...');

  // Test direct parsing first (doesn't require server)
  testExcelParsingDirectly()
    .then(() => {
      console.log('\n🌐 Testing via API (requires server to be running)...');
      return testBlinkitUpload();
    })
    .then(() => {
      console.log('\n🎉 Testing completed!');
    })
    .catch(error => {
      console.error('💥 Test suite failed:', error);
    });
}

module.exports = { testBlinkitUpload, testExcelParsingDirectly };