import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Read the Excel file
const filePath = 'c:\\Users\\singh\\Downloads\\664155NW po.xlsx';

try {
  console.log('📂 Analyzing Excel file:', filePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }

  // Read the Excel file
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  console.log('📊 Workbook Info:');
  console.log('- Sheet Names:', workbook.SheetNames);
  console.log('- Number of Sheets:', workbook.SheetNames.length);

  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    console.log(`\n📋 Sheet ${sheetIndex + 1}: "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row numbering
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`- Total rows: ${jsonData.length}`);
    console.log(`- Data range: ${worksheet['!ref'] || 'Unknown'}`);

    // Show first 20 rows with row numbers
    console.log('\n🔍 First 20 rows of data:');
    for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
      const row = jsonData[i];
      console.log(`Row ${i + 1}:`, row ? row.slice(0, 10) : 'Empty row');

      // If row has data, show more details for first few rows
      if (i < 10 && row && row.length > 0) {
        row.forEach((cell, colIndex) => {
          if (cell && cell.toString().trim() !== '') {
            console.log(`  - Col ${colIndex + 1}: "${cell}" (${typeof cell})`);
          }
        });
      }
    }

    // Look for potential header rows (rows with multiple text values)
    console.log('\n📋 Potential header rows:');
    for (let i = 0; i < Math.min(jsonData.length, 30); i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const textCells = row.filter(cell =>
          cell && typeof cell === 'string' && cell.toString().length > 2
        ).length;

        if (textCells >= 3) {
          console.log(`Row ${i + 1} (${textCells} text cells):`, row.slice(0, 10));
        }
      }
    }

    // Look for potential PO number patterns
    console.log('\n🔍 Looking for PO Number patterns:');
    for (let i = 0; i < Math.min(jsonData.length, 50); i++) {
      const row = jsonData[i];
      if (row) {
        row.forEach((cell, colIndex) => {
          if (cell) {
            const cellStr = cell.toString();
            // Look for patterns like 664155NW or similar
            if (cellStr.match(/^[A-Z0-9]{6,}$/)) {
              console.log(`Row ${i + 1}, Col ${colIndex + 1}: Potential PO Number: "${cellStr}"`);
            }
            if (cellStr.toLowerCase().includes('po') && cellStr.toLowerCase().includes('number')) {
              console.log(`Row ${i + 1}, Col ${colIndex + 1}: PO Number label: "${cellStr}"`);
            }
          }
        });
      }
    }

    // Look for common Amazon/product-related headers
    console.log('\n🛒 Looking for product/Amazon headers:');
    const targetHeaders = ['asin', 'sku', 'product', 'name', 'description', 'quantity', 'price', 'amount', 'brand', 'category'];
    for (let i = 0; i < Math.min(jsonData.length, 30); i++) {
      const row = jsonData[i];
      if (row) {
        const headerMatches = [];
        row.forEach((cell, colIndex) => {
          if (cell && typeof cell === 'string') {
            const cellStr = cell.toString().toLowerCase();
            const matches = targetHeaders.filter(header => cellStr.includes(header));
            if (matches.length > 0) {
              headerMatches.push(`Col ${colIndex + 1}: "${cell}" (matches: ${matches.join(', ')})`);
            }
          }
        });

        if (headerMatches.length >= 2) {
          console.log(`Row ${i + 1}: ${headerMatches.join(' | ')}`);
        }
      }
    }
  });

  console.log('\n✅ Analysis complete!');

} catch (error) {
  console.error('❌ Error analyzing Excel file:', error.message);
  console.error('Full error:', error);
}