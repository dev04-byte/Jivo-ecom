const XLSX = require('xlsx');
const path = require('path');

// Test files
const testFiles = [
  'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FBHWN06900132.xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FJSWG06907554.xls'
];

console.log('🔍 Re-analyzing Flipkart PO Excel structure...\n');

testFiles.forEach((filePath, index) => {
  try {
    console.log(`\n📄 File ${index + 1}: ${path.basename(filePath)}`);
    console.log('=' .repeat(50));

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const worksheet = workbook.Sheets[sheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Find headers row
    const headerRowIndex = jsonData.findIndex(row =>
      row && row.includes && row.includes('S. no.') && row.includes('HSN/SA Code')
    );

    if (headerRowIndex >= 0) {
      console.log('✅ Headers found at row:', headerRowIndex + 1);

      // Check each row after headers
      for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 5, jsonData.length); i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) {
          console.log(`Row ${i + 1}: [EMPTY]`);
          continue;
        }

        console.log(`\nRow ${i + 1}:`);
        console.log('  Cell 0 (S.no):', row[0]);
        console.log('  Cell 1 (HSN):', row[1]);
        console.log('  Cell 2 (FSN):', row[2]);
        console.log('  Cell 3 (Qty):', row[3]);
        console.log('  Cell 6 (Title):', row[6]);

        // Check if this is a data row
        if (row[0] && !isNaN(parseInt(row[0]))) {
          console.log('  ✅ This is a DATA ROW!');
        } else if (row[0] && row[0].toString().includes('Total')) {
          console.log('  📊 This is the TOTAL ROW');
        } else if (row[0] && row[0].toString().includes('Important')) {
          console.log('  ℹ️ This is the NOTIFICATION ROW');
        } else if (!row[0] && row[3] && row[3].toString().includes('Total')) {
          console.log('  📊 This is the SUMMARY ROW (Total Quantity)');
        }
      }
    }

  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\n✅ Structure analysis complete!');