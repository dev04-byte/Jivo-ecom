// Simple test script to verify Zepto parser functionality
const fs = require('fs');
const path = require('path');

// Read the test CSV file
const csvPath = path.join(__dirname, 'test_zepto_po.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

console.log('CSV Content:');
console.log(csvContent);
console.log('\n=== TESTING ZEPTO PARSER ===\n');

// Import and test the parser
const { parseZeptoPO } = require('./server/csv-parser.ts');

try {
  const result = parseZeptoPO(csvContent, 'test-user');

  console.log('✅ Parser Result:');
  console.log('Number of POs found:', result.poList.length);

  result.poList.forEach((po, index) => {
    console.log(`\n--- PO ${index + 1} ---`);
    console.log('Header:', {
      po_number: po.header.po_number,
      po_date: po.header.po_date,
      status: po.header.status,
      vendor_code: po.header.vendor_code,
      vendor_name: po.header.vendor_name,
      po_amount: po.header.po_amount,
      delivery_location: po.header.delivery_location,
      total_quantity: po.header.total_quantity,
      total_amount: po.header.total_amount,
      unique_brands: po.header.unique_brands
    });
    console.log('Number of lines:', po.lines.length);
    console.log('First line:', po.lines[0]);
  });

} catch (error) {
  console.error('❌ Parser Error:', error.message);
  console.error(error.stack);
}