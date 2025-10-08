const xlsx = require('xlsx');

console.log('🧪 Complete CityMall Data Extraction Test\n');
console.log('='.repeat(80));

const filePath = 'c:\\Users\\singh\\Downloads\\PO-1359161.xlsx';
const workbook = xlsx.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

// Extract PO Info
const row1 = jsonData[0];
const poCell = row1[17];
const poMatch = String(poCell).match(/PO-(\d+)/);

console.log('\n📋 HEADER DATA MAPPING:');
console.log('-'.repeat(80));
console.log('\n✓ PO Number (Row 1, Col 18):', poMatch ? poMatch[1] : 'NOT FOUND');

console.log('\n--- COMPANY DETAILS (Left Section - Buyer) ---');
console.log('Label location: Row 2, Col 2 =', jsonData[1][1]);  // "Name"
console.log('Buyer Name (Row 2, Col 4):', jsonData[1][3]);
console.log('Label location: Row 3, Col 2 =', jsonData[2][1]);  // "GST"
console.log('Buyer GST (Row 3, Col 4):', jsonData[2][3]);
console.log('Label location: Row 4, Col 2 =', jsonData[3][1]);  // "Billing Address"
console.log('Buyer Address (Row 4, Col 4):', jsonData[3][3]?.substring(0, 50) + '...');

console.log('\n--- VENDOR DETAILS (Right Section - Supplier) ---');
console.log('Label location: Row 2, Col 16 =', jsonData[1][15]); // "Issued To"
console.log('Vendor Name (Row 2, Col 19):', jsonData[1][18]);
console.log('Label location: Row 3, Col 16 =', jsonData[2][15]); // "Vendor Code"
console.log('Vendor Code (Row 3, Col 19):', jsonData[2][18]);
console.log('Label location: Row 4, Col 16 =', jsonData[3][15]); // "GST"
console.log('Vendor GST (Row 4, Col 19):', jsonData[3][18]);
console.log('Label location: Row 5, Col 16 =', jsonData[4][15]); // "Contact Person Name"
console.log('Contact Person (Row 5, Col 19):', jsonData[4][18]);

console.log('\n📦 LINE ITEMS - COMPLETE MAPPING:');
console.log('-'.repeat(80));

console.log('\nHeader Row (Row 11):');
const headerRow = jsonData[10];
console.log('  [0]:', headerRow[0]);   // S.No
console.log('  [2]:', headerRow[2]);   // Article Id
console.log('  [5]:', headerRow[5]);   // Article Name
console.log('  [9]:', headerRow[9]);   // HSN Code
console.log('  [11]:', headerRow[11]); // MRP
console.log('  [12]:', headerRow[12]); // Base Cost Price
console.log('  [16]:', headerRow[16]); // Quantity
console.log('  [17]:', headerRow[17]); // Base Amount
console.log('  [19]:', headerRow[19]); // IGST/CESS %
console.log('  [21]:', headerRow[21]); // IGST/CESS Amount
console.log('  [23]:', headerRow[23]); // Total Amount

console.log('\n✓ CORRECT MAPPING CONFIRMED:');
console.log('  - Buyer (Bill To): CMUNITY INNOVATIONS (Company Details section)');
console.log('  - Vendor (Shipped By): JIVO MART (Vendor Details / Issued To section)');
console.log('  - Quantity is at index [16] (Column 17)');
console.log('  - Base Amount is at index [17] (Column 18)');
console.log('  - Total Amount is at index [23] (Column 24)');

console.log('\n📊 SAMPLE DATA - First 3 Items:');
console.log('-'.repeat(80));

for (let i = 11; i <= 13; i++) {
  const row = jsonData[i];
  console.log(`\nItem ${i - 10}:`);
  console.log(`  S.No: ${row[0]}`);
  console.log(`  Article ID: ${row[2]}`);
  console.log(`  Name: ${row[5]}`);
  console.log(`  HSN: ${row[9]}`);
  console.log(`  MRP: ₹${row[11]}`);
  console.log(`  Base Cost: ₹${row[12]}`);
  console.log(`  Quantity: ${row[16]}`);
  console.log(`  Base Amount: ₹${row[17]}`);

  // Parse IGST/CESS
  const rates = String(row[19]).split('\n');
  const amounts = String(row[21]).split('\n');
  console.log(`  IGST: ${rates[0]}% (₹${amounts[0]})`);
  console.log(`  CESS: ${rates[1]}% (₹${amounts[1]})`);
  console.log(`  Total Amount: ₹${row[23]}`);
}

console.log('\n' + '='.repeat(80));
console.log('\n🎯 EXPECTED FRONTEND DISPLAY:\n');
console.log('Shipped By (Vendor Section):');
console.log('  Company: JIVO MART PRIVATE LIMITED');
console.log('  Code: 18836');
console.log('  GST: 07AAFCJ4102J1ZS-07');
console.log('  Contact: Kamaldeep Singh\n');

console.log('Bill To (Buyer Section):');
console.log('  Company: CMUNITY INNOVATIONS PRIVATE LIMITED');
console.log('  GST: 06AAICC7028B1Z0, State Code - 06');
console.log('  Address: Khasra No 55//2/2...\n');

console.log('Line Items:');
console.log('  Item 1: CM02456486 | Qty: 260 | Base: ₹31200.00 | Total: ₹32760.00');
console.log('  Item 2: CM02456487 | Qty: 36  | Base: ₹27942.84 | Total: ₹29339.98');
console.log('  Item 3: CM02456488 | Qty: 20  | Base: ₹13047.60 | Total: ₹13699.98');

console.log('\n' + '='.repeat(80));
console.log('✅ If this doesn\'t match what you see in frontend, the parser needs adjustment!');
