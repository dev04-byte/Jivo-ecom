import fs from 'fs';
import XLSX from 'xlsx';

// Path to the Excel file
const filePath = 'C:\\Users\\singh\\Downloads\\Purchase Order PO-1357102 (2).xlsx';

async function analyzeCityMallExcel() {
  try {
    console.log('Analyzing CityMall Excel file:', filePath);
    console.log('==================================================\n');

    // Read the file
    const buffer = fs.readFileSync(filePath);

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    console.log('Workbook Sheet Names:', workbook.SheetNames);
    console.log('Number of sheets:', workbook.SheetNames.length);

    // Process each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n=== Sheet ${index + 1}: "${sheetName}" ===`);

      const worksheet = workbook.Sheets[sheetName];

      // Get sheet range
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      console.log(`Range: ${worksheet['!ref']} (${range.e.r - range.s.r + 1} rows, ${range.e.c - range.s.c + 1} columns)`);

      // Try different parsing methods
      console.log('\n--- Method 1: Raw data (first 10 rows) ---');
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        range: { s: { r: 0, c: 0 }, e: { r: Math.min(10, range.e.r), c: range.e.c } }
      });

      rawData.forEach((row: any, idx: number) => {
        console.log(`Row ${idx}:`, row);
      });

      console.log('\n--- Method 2: With headers ---');
      const withHeaders = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        blankrows: false,
        range: 0
      });

      if (withHeaders.length > 0) {
        console.log('First record:', withHeaders[0]);
        console.log('Total records:', withHeaders.length);
        console.log('Column names:', Object.keys(withHeaders[0]));
      }

      // Look for specific patterns in the data
      console.log('\n--- Looking for PO data patterns ---');

      // Check if it's a CityMall format
      const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // Find header row
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(20, allData.length); i++) {
        const row = allData[i] as any[];
        if (row && row.length > 0) {
          const cellValues = row.map(cell => String(cell).toLowerCase());
          // Look for typical PO headers
          if (cellValues.some(val => val.includes('article') || val.includes('sku') || val.includes('product') || val.includes('s.no') || val.includes('sr no'))) {
            headerRowIndex = i;
            console.log(`Found potential header row at index ${i}:`, row);
            break;
          }
        }
      }

      if (headerRowIndex >= 0) {
        // Parse with found header
        const dataWithCorrectHeader = XLSX.utils.sheet_to_json(worksheet, {
          header: allData[headerRowIndex] as string[],
          defval: '',
          blankrows: false,
          range: headerRowIndex
        });

        console.log('\nData with detected headers:');
        console.log('Total items:', dataWithCorrectHeader.length - 1);
        if (dataWithCorrectHeader.length > 1) {
          console.log('First item:', dataWithCorrectHeader[1]);
        }
      }
    });

    console.log('\n==================================================');
    console.log('ANALYSIS COMPLETED!');

  } catch (error: any) {
    console.error('\n!!! ERROR DURING ANALYSIS !!!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

// Run the analysis
analyzeCityMallExcel();