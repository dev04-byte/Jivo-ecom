import fs from 'fs';
import { parseFlipkartGroceryExcelPO } from './server/flipkart-excel-parser.js';

console.log('🔍 Testing Flipkart Excel parser directly...\n');

// Test file
const testFile = 'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls';

try {
  console.log('📄 Reading file:', testFile);
  const buffer = fs.readFileSync(testFile);
  console.log('✅ File read successfully, size:', buffer.length, 'bytes');

  console.log('\n🔧 Parsing Excel file...');
  const result = parseFlipkartGroceryExcelPO(buffer, 'test-user');

  console.log('\n✅ Parsing successful!');
  console.log('📋 Header Information:');
  console.log('  • PO Number:', result.header.po_number);
  console.log('  • Supplier:', result.header.supplier_name);
  console.log('  • Total Quantity:', result.header.total_quantity);
  console.log('  • Total Amount:', result.header.total_amount);

  console.log('\n📦 Line Items:', result.lines.length);
  result.lines.forEach((line, index) => {
    console.log(`\n  Line ${index + 1}:`);
    console.log('    • Line Number:', line.line_number);
    console.log('    • HSN Code:', line.hsn_code);
    console.log('    • FSN:', line.fsn_isbn);
    console.log('    • Title:', line.title);
    console.log('    • Quantity:', line.quantity);
    console.log('    • Supplier Price:', line.supplier_price);
    console.log('    • Total Amount:', line.total_amount);
  });

  console.log('\n🎉 Parser is working correctly!');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}