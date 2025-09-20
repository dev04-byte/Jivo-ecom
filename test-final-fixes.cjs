const XLSX = require('xlsx');
const fs = require('fs');

console.log('🧪 Testing final Flipkart parser fixes...\n');

// Updated parseDate function with UTC
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
      console.log(`📅 Converted Excel serial ${serialNumber} to date:`, result.toISOString().split('T')[0]);
      return result;
    }

    // Handle different date formats
    if (cleanDateStr.includes('-') || cleanDateStr.includes('/')) {
      const separator = cleanDateStr.includes('-') ? '-' : '/';
      const parts = cleanDateStr.split(separator);
      if (parts.length === 3) {
        let day, month, year;

        // Detect format: YYYY-MM-DD vs DD-MM-YY/YYYY
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          day = parseInt(parts[2]);
          console.log(`📅 Detected YYYY-MM-DD format: ${cleanDateStr}`);
        } else {
          // DD-MM-YY/YYYY format
          day = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1;
          year = parseInt(parts[2]);

          if (year < 100) {
            year += year < 50 ? 2000 : 1900;
          }
          console.log(`📅 Detected DD-MM-YY/YYYY format: ${cleanDateStr}`);
        }

        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
          // Create date in UTC to avoid timezone issues
          const result = new Date(Date.UTC(year, month, day));
          console.log(`📅 Parsed date ${cleanDateStr} as:`, result.toISOString().split('T')[0]);
          return result;
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

const testFile = 'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls';

if (fs.existsSync(testFile)) {
  console.log('📄 Testing fixes with:', testFile.split('\\').pop());

  const buffer = fs.readFileSync(testFile);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Test credit term extraction
  console.log('\n=== CREDIT TERM TEST ===');
  const paymentRow = jsonData.find((row) => row && row[0] === 'MODE OF PAYMENT');
  if (paymentRow) {
    console.log('Payment row:', paymentRow);

    const creditTermIndex = paymentRow.findIndex((cell) => cell === 'CREDIT TERM');
    console.log(`Credit term index: ${creditTermIndex}`);

    if (creditTermIndex >= 0) {
      console.log(`Value at +1: "${paymentRow[creditTermIndex + 1]}"`);
      console.log(`Value at +2: "${paymentRow[creditTermIndex + 2]}"`);

      // Check both +1 and +2 positions
      const creditTermValue = paymentRow[creditTermIndex + 1] || paymentRow[creditTermIndex + 2];
      if (creditTermValue) {
        console.log(`✅ Credit term found: "${creditTermValue.toString().trim()}"`);
      } else {
        console.log('❌ Credit term value is empty');
      }
    }
  }

  // Test date parsing
  console.log('\n=== DATE PARSING TEST ===');
  const testDates = ['2025-09-21', '21-09-25', '21/09/25'];
  testDates.forEach(date => {
    const parsed = parseDate(date);
    console.log(`"${date}" -> ${parsed ? parsed.toISOString().split('T')[0] : 'Failed'}`);
  });

  console.log('\n✅ All fixes tested!');
} else {
  console.log('❌ Test file not found');
}