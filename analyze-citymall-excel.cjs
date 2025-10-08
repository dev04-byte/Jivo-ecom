const xlsx = require('xlsx');

async function analyzeCityMallExcel() {
  try {
    console.log('📊 Analyzing CityMall Excel file structure...\n');

    const filePath = 'c:\\Users\\singh\\Downloads\\PO-1359161.xlsx';
    const workbook = xlsx.readFile(filePath);

    console.log('📋 Sheet Names:', workbook.SheetNames);
    console.log('');

    // Analyze each sheet
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Sheet ${sheetIndex + 1}: "${sheetName}"`);
      console.log('='.repeat(80));

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

      console.log(`\nTotal Rows: ${jsonData.length}`);
      console.log('\n📄 First 30 rows with structure:\n');

      for (let i = 0; i < Math.min(30, jsonData.length); i++) {
        const row = jsonData[i];
        console.log(`Row ${i + 1}:`);

        if (Array.isArray(row) && row.length > 0) {
          row.forEach((cell, colIndex) => {
            if (cell !== '') {
              console.log(`  Column ${colIndex + 1}: "${cell}"`);
            }
          });
        } else {
          console.log('  [Empty row]');
        }
        console.log('');
      }

      // Check if there are line items (table data)
      console.log('\n🔍 Looking for line items table...');
      let headerRowIndex = -1;
      const possibleHeaders = ['sku', 'item', 'product', 'description', 'quantity', 'qty', 'price', 'amount'];

      for (let i = 0; i < Math.min(50, jsonData.length); i++) {
        const row = jsonData[i];
        if (Array.isArray(row)) {
          const rowStr = row.join('|').toLowerCase();
          if (possibleHeaders.some(header => rowStr.includes(header))) {
            headerRowIndex = i;
            console.log(`\n✅ Found potential header row at Row ${i + 1}:`);
            console.log('   ', row.join(' | '));
            break;
          }
        }
      }

      if (headerRowIndex >= 0 && headerRowIndex < jsonData.length - 1) {
        console.log('\n📦 Sample line items (next 10 rows after header):');
        for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 11, jsonData.length); i++) {
          console.log(`\nRow ${i + 1}:`, jsonData[i]);
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis complete!');

  } catch (error) {
    console.error('❌ Error analyzing Excel file:', error.message);
    console.error('Full error:', error);
  }
}

analyzeCityMallExcel();
