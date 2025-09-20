import fs from 'fs';
import { parseSwiggyCSV } from './server/swiggy-csv-parser.ts';

// Test the actual Swiggy CSV parser
async function testSwiggyParser() {
  try {
    console.log('🔄 Testing Swiggy CSV parser function...');

    // Read the CSV file
    const csvPath = 'C:\\Users\\singh\\Downloads\\PO_1758265329897.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    console.log(`📄 Testing with CSV file (${csvContent.length} characters)`);

    // Call the actual parser function
    const result = parseSwiggyCSV(csvContent, 'test-user');

    console.log('✅ Parser completed successfully!');
    console.log(`📋 Result structure:`);
    console.log(`  - Total POs: ${result.totalPOs}`);
    console.log(`  - PO List length: ${result.poList.length}`);

    // Show first PO details
    if (result.poList.length > 0) {
      const firstPO = result.poList[0];
      console.log(`📋 First PO details:`);
      console.log(`  - PO Number: ${firstPO.header.po_number}`);
      console.log(`  - Vendor: ${firstPO.header.vendor_name}`);
      console.log(`  - Total Items: ${firstPO.header.total_items}`);
      console.log(`  - Grand Total: ${firstPO.header.grand_total}`);
      console.log(`  - Lines count: ${firstPO.lines.length}`);

      if (firstPO.lines.length > 0) {
        console.log(`📋 First line item:`);
        console.log(`  - Item Code: ${firstPO.lines[0].item_code}`);
        console.log(`  - Description: ${firstPO.lines[0].item_description}`);
        console.log(`  - Quantity: ${firstPO.lines[0].quantity}`);
      }
    }

  } catch (error) {
    console.error('❌ Parser test failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSwiggyParser();