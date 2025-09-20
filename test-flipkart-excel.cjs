const XLSX = require('xlsx');
const path = require('path');

// Test files
const testFiles = [
  'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FBHWN06900132.xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FJSWG06907554.xls'
];

console.log('🔍 Analyzing Flipkart PO Excel files...\n');

testFiles.forEach((filePath, index) => {
  try {
    console.log(`\n📄 File ${index + 1}: ${path.basename(filePath)}`);
    console.log('=' .repeat(50));

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log('📊 Sheets found:', sheetNames);

    // Analyze first sheet
    const worksheet = workbook.Sheets[sheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📝 Total rows:', jsonData.length);
    console.log('\n🔍 First 10 rows:');

    jsonData.slice(0, 10).forEach((row, idx) => {
      if (row && row.length > 0) {
        console.log(`Row ${idx + 1}:`, row.slice(0, 8)); // Show first 8 columns
      }
    });

    // Look for patterns
    console.log('\n🎯 Structure Analysis:');

    // Find PO number
    for (let i = 0; i < Math.min(15, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const firstCell = row[0]?.toString() || '';
        if (firstCell.toLowerCase().includes('purchase order') ||
            firstCell.toLowerCase().includes('po') ||
            firstCell.startsWith('F') && firstCell.length > 10) {
          console.log(`  • Potential PO info at row ${i + 1}:`, row.slice(0, 5));
        }
      }
    }

    // Find table headers
    for (let i = 0; i < Math.min(20, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.length > 5) {
        const rowStr = row.join('|').toLowerCase();
        if (rowStr.includes('item') || rowStr.includes('product') ||
            rowStr.includes('description') || rowStr.includes('quantity') ||
            rowStr.includes('hsn') || rowStr.includes('price')) {
          console.log(`  • Potential table headers at row ${i + 1}:`, row);
        }
      }
    }

  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\n✅ Analysis complete!');