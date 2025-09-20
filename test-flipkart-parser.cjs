const fs = require('fs');
const path = require('path');

// Since we can't directly import the TypeScript file, let's build it first or use a simpler test
console.log('Note: This test requires the TypeScript files to be compiled first.');

// Test files
const testFiles = [
  'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FBHWN06900132.xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FJSWG06907554.xls'
];

console.log('🔍 Testing Flipkart Excel parser...\n');

testFiles.forEach((filePath, index) => {
  try {
    console.log(`\n📄 Testing File ${index + 1}: ${path.basename(filePath)}`);
    console.log('=' .repeat(50));

    // Read file as buffer
    const buffer = fs.readFileSync(filePath);
    console.log('📊 File size:', buffer.length, 'bytes');

    // Parse using the new parser
    const result = parseFlipkartGroceryExcelPO(buffer, 'test-user');

    console.log('✅ Parsing successful!');
    console.log('📋 PO Number:', result.header.po_number);
    console.log('🏢 Supplier:', result.header.supplier_name);
    console.log('📦 Line items:', result.lines.length);
    console.log('🔢 Total Quantity:', result.header.total_quantity);
    console.log('💰 Total Amount:', result.header.total_amount);

    // Show first line item details
    if (result.lines.length > 0) {
      console.log('\n📦 First line item:');
      const firstLine = result.lines[0];
      console.log('  • Line Number:', firstLine.line_number);
      console.log('  • HSN Code:', firstLine.hsn_code);
      console.log('  • Product Title:', firstLine.title);
      console.log('  • Quantity:', firstLine.quantity);
      console.log('  • Supplier Price:', firstLine.supplier_price);
      console.log('  • Total Amount:', firstLine.total_amount);
    }

  } catch (error) {
    console.error(`❌ Error parsing ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\n✅ Testing complete!');