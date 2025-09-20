const XLSX = require('xlsx');
const path = require('path');

// Test files
const testFiles = [
  'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FBHWN06900132.xls',
  'C:\\Users\\singh\\Downloads\\purchase_order_FJSWG06907554.xls'
];

console.log('🔍 Detailed Analysis of Flipkart PO Excel files...\n');

testFiles.forEach((filePath, index) => {
  try {
    console.log(`\n📄 File ${index + 1}: ${path.basename(filePath)}`);
    console.log('=' .repeat(50));

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log('📊 Sheets found:', sheetNames);

    // Analyze first sheet in detail
    const worksheet = workbook.Sheets[sheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📝 Total rows:', jsonData.length);

    // Check for line items specifically
    console.log('\n🔍 Looking for line items after headers...');

    const headerRowIndex = jsonData.findIndex(row =>
      row && row.includes && row.includes('S. no.') && row.includes('HSN/SA Code')
    );

    if (headerRowIndex >= 0) {
      console.log('✅ Found table headers at row:', headerRowIndex + 1);
      console.log('📋 Headers:', jsonData[headerRowIndex]);

      // Check rows after headers for actual line items
      let itemCount = 0;
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        // Check if this is a valid line item (has serial number and data)
        const serialNum = row[0];
        if (serialNum && !isNaN(parseInt(serialNum))) {
          itemCount++;
          console.log(`📦 Line item ${itemCount} (Row ${i + 1}):`, row.slice(0, 8));
        } else if (row[0] && row[0].toString().includes('Total Quantity')) {
          console.log(`📊 Summary row (Row ${i + 1}):`, row);
          break;
        } else if (row[0] && row[0].toString().trim() !== '') {
          console.log(`ℹ️  Other row (Row ${i + 1}):`, row.slice(0, 5));
        }
      }

      if (itemCount === 0) {
        console.log('❌ No line items found - this appears to be a header-only PO!');
      } else {
        console.log(`✅ Found ${itemCount} line items`);
      }
    } else {
      console.log('❌ Could not find table headers');
    }

    // Extract key information
    console.log('\n📋 Key Information:');

    // PO Number
    const poRow = jsonData.find(row => row && row[0] === 'PO#');
    if (poRow) {
      console.log('  • PO Number:', poRow[1]);
    }

    // Supplier
    const supplierRow = jsonData.find(row => row && row[0] === 'SUPPLIER NAME');
    if (supplierRow) {
      console.log('  • Supplier:', supplierRow[1]);
    }

    // Total quantity and amount
    const totalRow = jsonData.find(row =>
      row && row.some(cell => cell && cell.toString().includes('Total Quantity'))
    );
    if (totalRow) {
      const qtyIndex = totalRow.findIndex(cell => cell && cell.toString().includes('Total Quantity'));
      if (qtyIndex >= 0 && totalRow[qtyIndex + 1]) {
        console.log('  • Total Quantity:', totalRow[qtyIndex + 1]);
      }

      const totalIndex = totalRow.findIndex(cell => cell && cell.toString().includes('Total='));
      if (totalIndex >= 0 && totalRow[totalIndex + 1]) {
        console.log('  • Total Amount:', totalRow[totalIndex + 1]);
      }
    }

  } catch (error) {
    console.error(`❌ Error reading ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\n✅ Detailed analysis complete!');