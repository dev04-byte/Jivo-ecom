const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔍 Testing REAL Flipkart PO file...\n');

const testFile = 'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls';

if (fs.existsSync(testFile)) {
  console.log('📄 Reading file:', testFile.split('\\').pop());

  const buffer = fs.readFileSync(testFile);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log(`✅ Total rows: ${jsonData.length}\n`);

  // Show first 30 rows to understand structure
  console.log('=== COMPLETE FILE STRUCTURE (First 30 rows) ===');
  for (let i = 0; i < Math.min(30, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.length > 0) {
      console.log(`Row ${i + 1}:`, row.map((cell, cellIndex) =>
        `[${cellIndex}] "${cell}"`
      ).join(' | '));
    }
  }

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
  }

  console.log('\n=== SEARCHING FOR REQUIRED BY DATE IN LINE ITEMS ===');

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

    // Look for required by date column
    const requiredByIndex = headers.findIndex(header =>
      header && header.toString().toLowerCase().includes('required')
    );

    if (requiredByIndex >= 0) {
      console.log(`\n📅 Found Required By column at index ${requiredByIndex}: "${headers[requiredByIndex]}"`);

      // Check first 5 line items
      console.log('\n📦 First 5 line items - Required By Date values:');
      for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 6, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && row[0] && !isNaN(parseInt(row[0]))) {
          const requiredByValue = row[requiredByIndex];
          console.log(`Line ${i - headerRowIndex}: Required By = "${requiredByValue}" (type: ${typeof requiredByValue})`);
        }
      }
    } else {
      console.log('❌ Required By Date column not found');
    }
  } else {
    console.log('❌ Table headers not found');
  }

  // Test with the actual parser
  console.log('\n=== TESTING WITH ACTUAL PARSER ===');
  try {
    // Simulate the parseDate function
    function parseDate(dateStr) {
      if (!dateStr) return undefined;

      try {
        const cleanDateStr = dateStr.toString().trim();

        // Handle Excel serial number (numeric date)
        if (/^\d+(\.\d+)?$/.test(cleanDateStr)) {
          const serialNumber = parseFloat(cleanDateStr);
          const excelEpoch = new Date(1900, 0, 1);
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const result = new Date(excelEpoch.getTime() + (serialNumber - 2) * millisecondsPerDay);
          return result;
        }

        // Handle DD-MM-YY, DD-MM-YYYY, DD/MM/YY, DD/MM/YYYY formats
        if (cleanDateStr.includes('-') || cleanDateStr.includes('/')) {
          const separator = cleanDateStr.includes('-') ? '-' : '/';
          const parts = cleanDateStr.split(separator);
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            let year = parseInt(parts[2]);

            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }

            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
              return new Date(year, month, day);
            }
          }
        }

        const result = new Date(cleanDateStr);
        if (!isNaN(result.getTime())) {
          return result;
        }

        return undefined;
      } catch (error) {
        return undefined;
      }
    }

    if (headerRowIndex >= 0) {
      const headers = jsonData[headerRowIndex];
      const requiredByIndex = headers.findIndex(header =>
        header && header.toString().toLowerCase().includes('required')
      );

      if (requiredByIndex >= 0) {
        console.log('Testing date parsing with actual values:');
        for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 4, jsonData.length); i++) {
          const row = jsonData[i];
          if (row && row[0] && !isNaN(parseInt(row[0]))) {
            const dateValue = row[requiredByIndex];
            const parsedDate = parseDate(dateValue);
            console.log(`  "${dateValue}" -> ${parsedDate ? parsedDate.toISOString().split('T')[0] : 'Failed to parse'}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error testing parser:', error.message);
  }

} else {
  console.log('❌ Test file not found');
}