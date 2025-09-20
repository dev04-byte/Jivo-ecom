const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔍 Debugging real Flipkart Excel file structure...\n');

const sampleFile = 'C:\\Users\\singh\\OneDrive\\Desktop\\Jivo-Ecom_App-main\\attached_assets\\flipkart SC_1754917958254.xlsx';

if (fs.existsSync(sampleFile)) {
  console.log('📄 Reading file:', sampleFile.split('\\').pop());

  const buffer = fs.readFileSync(sampleFile);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`✅ Total rows: ${jsonData.length}\n`);

  // Print all rows to understand structure
  console.log('=== COMPLETE FILE STRUCTURE ===');
  jsonData.forEach((row, index) => {
    if (row && row.length > 0) {
      console.log(`Row ${index + 1}:`, row.map((cell, cellIndex) =>
        `[${cellIndex}] "${cell}"`
      ).join(' | '));
    }
  });

  console.log('\n=== SEARCHING FOR CREDIT TERM ===');

  // Look for MODE OF PAYMENT row specifically
  const paymentRowIndex = jsonData.findIndex((row) => row && row[0] === 'MODE OF PAYMENT');
  if (paymentRowIndex >= 0) {
    console.log(`Found MODE OF PAYMENT at row ${paymentRowIndex + 1}:`);
    const paymentRow = jsonData[paymentRowIndex];
    paymentRow.forEach((cell, index) => {
      console.log(`  [${index}] "${cell}"`);
    });

    // Search for CREDIT TERM
    const creditTermIndex = paymentRow.findIndex((cell) =>
      cell && cell.toString().toUpperCase().includes('CREDIT')
    );

    if (creditTermIndex >= 0) {
      console.log(`\n💳 Found CREDIT related cell at index ${creditTermIndex}: "${paymentRow[creditTermIndex]}"`);
      if (paymentRow[creditTermIndex + 1]) {
        console.log(`💳 Credit term value: "${paymentRow[creditTermIndex + 1]}"`);
      }
    } else {
      console.log('❌ No CREDIT TERM found in payment row');
    }
  } else {
    console.log('❌ MODE OF PAYMENT row not found');

    // Search for any row containing CREDIT
    console.log('\n🔍 Searching for any row containing CREDIT...');
    jsonData.forEach((row, index) => {
      if (row && row.some(cell =>
        cell && cell.toString().toUpperCase().includes('CREDIT')
      )) {
        console.log(`Row ${index + 1} contains CREDIT:`, row);
      }
    });
  }

  console.log('\n=== SEARCHING FOR DATE COLUMNS ===');

  // Look for table headers
  const headerRowIndex = jsonData.findIndex((row) =>
    row && row[0] === 'S. no.' && row.includes('HSN/SA Code')
  );

  if (headerRowIndex >= 0) {
    console.log(`\n📋 Found table headers at row ${headerRowIndex + 1}:`);
    const headers = jsonData[headerRowIndex];
    headers.forEach((header, index) => {
      console.log(`  [${index}] "${header}"`);
    });

    // Look for date-related columns
    const dateColumns = [];
    headers.forEach((header, index) => {
      if (header && header.toString().toLowerCase().includes('date')) {
        dateColumns.push({index, header});
        console.log(`📅 Date column found at index ${index}: "${header}"`);
      }
    });

    // Check a few line items
    console.log('\n📦 First 3 line items:');
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 4, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row[0] && !isNaN(parseInt(row[0]))) {
        console.log(`\nLine ${i - headerRowIndex}:`);
        row.forEach((cell, index) => {
          if (cell !== undefined && cell !== '') {
            console.log(`  [${index}] "${cell}"`);
          }
        });

        // Check date columns specifically
        dateColumns.forEach(({index, header}) => {
          if (row[index]) {
            console.log(`  📅 ${header}: "${row[index]}" (type: ${typeof row[index]})`);
          }
        });
      }
    }
  } else {
    console.log('❌ Table headers not found');
  }

} else {
  console.log('❌ Sample file not found');
}