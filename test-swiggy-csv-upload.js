import fs from 'fs';
import path from 'path';

// Test script to verify Swiggy CSV upload functionality
async function testSwiggyCSVUpload() {
  try {
    console.log('🔄 Testing Swiggy CSV upload functionality...');

    // Import the CSV parser
    const { parseSwiggyCSV } = await import('./server/swiggy-csv-parser.js');

    // Test files paths
    const testFiles = [
      'C:\\Users\\singh\\Downloads\\FC5PO242846.csv',
      'C:\\Users\\singh\\Downloads\\PO_1758265329897.csv'
    ];

    for (const filePath of testFiles) {
      console.log(`\n📂 Testing file: ${path.basename(filePath)}`);

      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        continue;
      }

      // Read CSV content
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`📊 File size: ${csvContent.length} characters`);

      try {
        // Parse the CSV
        const parsedData = parseSwiggyCSV(csvContent, 'test-user');

        console.log(`✅ Successfully parsed ${parsedData.totalPOs} PO(s)`);

        // Display summary for each PO
        parsedData.poList.forEach((po, index) => {
          console.log(`\nPO #${index + 1}:`);
          console.log(`  - PO Number: ${po.header.po_number}`);
          console.log(`  - Vendor: ${po.header.vendor_name}`);
          console.log(`  - Total Items: ${po.header.total_items}`);
          console.log(`  - Total Quantity: ${po.header.total_quantity}`);
          console.log(`  - Grand Total: ${po.header.grand_total}`);
          console.log(`  - Line Items: ${po.lines.length}`);

          // Show first 3 line items
          console.log(`  - Sample Items:`);
          po.lines.slice(0, 3).forEach((line, lineIndex) => {
            console.log(`    ${lineIndex + 1}. ${line.item_code} - ${line.item_description} (Qty: ${line.quantity})`);
          });
        });

      } catch (parseError) {
        console.error(`❌ Parse error for ${filePath}:`, parseError.message);
      }
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSwiggyCSVUpload().catch(console.error);