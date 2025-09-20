const XLSX = require('xlsx');
const fs = require('fs');

console.log('🧪 Testing complete Flipkart parser with real PO file...\n');

// Improved parseDate function
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
          const result = new Date(year, month, day);
          console.log(`📅 Parsed date ${cleanDateStr} as:`, result.toISOString().split('T')[0]);
          return result;
        } else {
          console.warn(`⚠️ Invalid date components: day=${day}, month=${month+1}, year=${year}`);
        }
      }
    }

    const result = new Date(cleanDateStr);
    if (!isNaN(result.getTime())) {
      console.log(`📅 Parsed date ${cleanDateStr} as:`, result.toISOString().split('T')[0]);
      return result;
    }

    console.warn('⚠️ Unable to parse date:', cleanDateStr);
    return undefined;
  } catch (error) {
    console.warn('❌ Error parsing date:', dateStr, error);
    return undefined;
  }
}

function parseDecimal(value) {
  if (!value) return null;

  try {
    const cleanValue = value.toString()
      .replace(/[^\d.-]/g, '')
      .trim();

    if (cleanValue === '') return null;

    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed.toString();
  } catch (error) {
    return null;
  }
}

const testFile = 'C:\\Users\\singh\\Downloads\\purchase_order_FNH3G06748277 (1).xls';

if (fs.existsSync(testFile)) {
  console.log('📄 Parsing file:', testFile.split('\\').pop());

  const buffer = fs.readFileSync(testFile);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('✅ File loaded, processing...\n');

  // Extract header information
  let poNumber = '';
  let creditTerm = '';

  // Extract PO Number
  const poRow = jsonData.find((row) => row && row[0] === 'PO#');
  if (poRow && poRow[1]) {
    poNumber = poRow[1].toString().trim();
    console.log(`📋 PO Number: ${poNumber}`);
  }

  // Extract Payment Details
  const paymentRow = jsonData.find((row) => row && row[0] === 'MODE OF PAYMENT');
  if (paymentRow) {
    console.log('💳 Payment row found:', paymentRow);

    const creditTermIndex = paymentRow.findIndex((cell) => cell === 'CREDIT TERM');
    if (creditTermIndex >= 0 && paymentRow[creditTermIndex + 1]) {
      creditTerm = paymentRow[creditTermIndex + 1].toString().trim();
      console.log(`💳 Credit Term extracted: "${creditTerm}"`);
    } else {
      console.log('❌ Credit term not found');
    }
  }

  // Find table headers
  const headerRowIndex = jsonData.findIndex((row) =>
    row && row[0] === 'S. no.' && row.includes('HSN/SA Code')
  );

  if (headerRowIndex >= 0) {
    console.log(`\n📋 Table headers found at row ${headerRowIndex + 1}`);

    // Parse line items
    const lines = [];
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      if (!row || row.length === 0) continue;

      // Skip summary rows
      if (row.some((cell) => cell && cell.toString().includes('Total Quantity'))) {
        break;
      }

      // Check if valid line item
      const serialNum = row[0];
      if (!serialNum || isNaN(parseInt(serialNum.toString()))) {
        continue;
      }

      try {
        const lineNumber = parseInt(serialNum.toString());

        const line = {
          line_number: lineNumber,
          hsn_code: row[1]?.toString() || null,
          fsn_isbn: row[2]?.toString() || null,
          quantity: parseInt(row[3]?.toString() || '0'),
          pending_quantity: parseInt(row[4]?.toString() || '0'),
          uom: row[5]?.toString() || null,
          title: row[6]?.toString() || '',
          brand: row[8]?.toString() || null,
          type: row[9]?.toString() || null,
          ean: row[10]?.toString() || null,
          vertical: row[11]?.toString() || null,
          required_by_date: parseDate(row[12]?.toString()),
          supplier_mrp: parseDecimal(row[13]?.toString()),
          supplier_price: parseDecimal(row[14]?.toString()),
          taxable_value: parseDecimal(row[15]?.toString()),
          tax_amount: parseDecimal(row[24]?.toString()),
          total_amount: parseDecimal(row[25]?.toString()),
        };

        lines.push(line);
        console.log(`📦 Line ${lineNumber}:`, {
          title: line.title,
          required_by_date: line.required_by_date ? line.required_by_date.toISOString().split('T')[0] : 'null',
          supplier_price: line.supplier_price
        });
      } catch (error) {
        console.warn(`⚠️ Error parsing line ${i + 1}:`, error.message);
      }
    }

    console.log(`\n🎯 PARSING RESULTS:`);
    console.log(`PO Number: ${poNumber}`);
    console.log(`Credit Term: ${creditTerm}`);
    console.log(`Line Items: ${lines.length}`);
    console.log(`Required by dates found: ${lines.filter(l => l.required_by_date).length}`);

    if (lines.length > 0) {
      console.log('\n📊 Sample line item:');
      console.log(JSON.stringify(lines[0], null, 2));
    }

  } else {
    console.log('❌ Table headers not found');
  }
} else {
  console.log('❌ Test file not found');
}