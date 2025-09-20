const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔍 Debugging real Flipkart PO Excel file structure...\n');

const sampleFiles = [
  'C:\\Users\\singh\\OneDrive\\Desktop\\Jivo-Ecom_App-main\\attached_assets\\Flipkart Inventory_1754916172465.xlsx',
  'C:\\Users\\singh\\OneDrive\\Desktop\\Jivo-Ecom_App-main\\attached_assets\\flipkart SC_1754918615098.xlsx'
];

for (const sampleFile of sampleFiles) {
  if (fs.existsSync(sampleFile)) {
    console.log('📄 Reading file:', sampleFile.split('\\').pop());

    const buffer = fs.readFileSync(sampleFile);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`✅ Total rows: ${jsonData.length}\n`);

    // Check if this looks like a PO file
    console.log('=== CHECKING IF THIS IS A PO FILE ===');

    // Look for PO# row
    const hasPONumber = jsonData.some(row => row && row[0] === 'PO#');
    const hasSupplierName = jsonData.some(row => row && row[0] === 'SUPPLIER NAME');
    const hasModeOfPayment = jsonData.some(row => row && row[0] === 'MODE OF PAYMENT');
    const hasTableHeaders = jsonData.some(row => row && row[0] === 'S. no.' && row.includes('HSN/SA Code'));

    console.log('PO# row found:', hasPONumber);
    console.log('SUPPLIER NAME row found:', hasSupplierName);
    console.log('MODE OF PAYMENT row found:', hasModeOfPayment);
    console.log('Table headers found:', hasTableHeaders);

    if (hasPONumber && hasSupplierName && hasModeOfPayment && hasTableHeaders) {
      console.log('✅ This looks like a valid PO file!\n');

      // Show first 20 rows to understand structure
      console.log('=== FIRST 20 ROWS ===');
      for (let i = 0; i < Math.min(20, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          console.log(`Row ${i + 1}:`, row.slice(0, 10).map((cell, cellIndex) =>
            `[${cellIndex}] "${cell}"`
          ).join(' | '), row.length > 10 ? '...' : '');
        }
      }

      break; // Found a valid PO file, stop checking
    } else {
      console.log('❌ This is not a PO file (probably inventory/sales data)\n');
    }
  } else {
    console.log(`❌ File not found: ${sampleFile.split('\\').pop()}`);
  }
}

console.log('\n📝 RECOMMENDATION:');
console.log('The files in attached_assets appear to be inventory/sales files, not Purchase Orders.');
console.log('To test PO parsing, you need an actual Flipkart Purchase Order Excel file.');
console.log('A valid PO file should have:');
console.log('- Row with "PO#" in first column');
console.log('- Row with "SUPPLIER NAME" in first column');
console.log('- Row with "MODE OF PAYMENT" in first column');
console.log('- Table headers with "S. no." and "HSN/SA Code"');