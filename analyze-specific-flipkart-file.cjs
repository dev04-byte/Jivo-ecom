const XLSX = require('xlsx');

function analyzeSpecificFlipkartFile() {
  const filePath = "C:\\Users\\singh\\Downloads\\purchase_order_FLFWG06905883 (1).xls";

  console.log('🔍 DETAILED ANALYSIS OF FLIPKART EXCEL FILE');
  console.log('='.repeat(80));
  console.log('📂 File:', filePath);
  console.log('');

  try {
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📄 Sheet Name: ${sheetName}`);
    console.log(`📊 Sheet Range: ${worksheet['!ref']}`);

    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`📈 Total Rows: ${jsonData.length}`);
    console.log('');

    // Display all rows for complete structure understanding
    console.log('📋 COMPLETE FILE STRUCTURE:');
    console.log('='.repeat(80));

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      console.log(`\nRow ${i + 1}:`);
      if (row && row.length > 0) {
        row.forEach((cell, colIndex) => {
          if (cell !== undefined && cell !== null && cell !== '') {
            console.log(`  Col ${colIndex + 1}: "${cell}"`);
          }
        });
      } else {
        console.log('  [Empty Row]');
      }
    }

    // Find table headers
    console.log('\n\n🏷️  TABLE HEADERS ANALYSIS:');
    console.log('='.repeat(80));

    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0] === 'S. no.' && row.includes('HSN/SA Code')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex >= 0) {
      const headers = jsonData[headerRowIndex];
      console.log(`✅ Found table headers at row: ${headerRowIndex + 1}`);
      console.log(`📊 Total Columns: ${headers.length}`);
      console.log('');

      console.log('📝 ALL COLUMN MAPPINGS:');
      console.log('-'.repeat(80));
      headers.forEach((header, index) => {
        const isEmpty = !header || header.toString().trim() === '';
        console.log(`Column ${(index + 1).toString().padStart(2)}: ${isEmpty ? '[EMPTY]' : `"${header}"`}`);
      });

      // Show sample data with proper column mapping
      console.log('\n📊 SAMPLE DATA WITH COLUMN MAPPING:');
      console.log('-'.repeat(80));

      let dataRowCount = 0;
      for (let i = headerRowIndex + 1; i < jsonData.length && dataRowCount < 3; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0]?.toString() || '';
        if (firstCell.includes('Important Notification') ||
            firstCell.includes('Total Quantity') ||
            firstCell.includes('Please mention PO number')) {
          console.log(`\n📍 Found end marker at row ${i + 1}: "${firstCell}"`);
          break;
        }

        if (row[0] && !isNaN(parseInt(row[0].toString()))) {
          dataRowCount++;
          console.log(`\n🔸 Data Row ${dataRowCount} (Excel Row ${i + 1}):`);

          row.forEach((cell, colIndex) => {
            if (cell !== undefined && cell !== null && cell !== '') {
              const columnName = headers[colIndex] || `Col${colIndex + 1}`;
              const isEmpty = !headers[colIndex] || headers[colIndex].toString().trim() === '';
              console.log(`  ${columnName}${isEmpty ? ' [EMPTY_HEADER]' : ''}: "${cell}"`);
            }
          });
        }
      }

    } else {
      console.log('❌ Could not find table headers row');
    }

    // Extract header information from top rows
    console.log('\n\n📄 HEADER INFORMATION EXTRACTION:');
    console.log('='.repeat(80));

    const headerInfo = {};

    // Look for key information in first 10 rows
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.length > 0) {
        const firstCell = row[0]?.toString() || '';

        if (firstCell === 'PO#' && row[1]) {
          headerInfo.poNumber = row[1].toString();
        } else if (firstCell === 'SUPPLIER NAME' && row[1]) {
          headerInfo.supplierName = row[1].toString();
          if (row[4]) headerInfo.supplierAddress = row[4].toString();
        } else if (firstCell === 'BILLED TO ADDRESS' && row[2]) {
          headerInfo.billedToAddress = row[2].toString();
        } else if (firstCell === 'MODE OF PAYMENT') {
          if (row[2]) headerInfo.modeOfPayment = row[2].toString();

          const contractRefIndex = row.findIndex(cell => cell === 'CONTRACT REF ID');
          if (contractRefIndex >= 0 && row[contractRefIndex + 1]) {
            headerInfo.contractRefId = row[contractRefIndex + 1].toString();
          }

          const contractVersionIndex = row.findIndex(cell => cell === 'CONTRACT VERSION');
          if (contractVersionIndex >= 0 && row[contractVersionIndex + 1]) {
            headerInfo.contractVersion = row[contractVersionIndex + 1].toString();
          }
        }
      }
    }

    console.log('📋 Extracted Header Information:');
    Object.entries(headerInfo).forEach(([key, value]) => {
      console.log(`  ${key}: "${value}"`);
    });

  } catch (error) {
    console.error('❌ Error analyzing Excel file:', error);

    // Try to provide more details about the error
    if (error.code === 'ENOENT') {
      console.error('📂 File not found. Please check the file path.');
    } else if (error.message.includes('Unsupported file')) {
      console.error('📄 File format not supported. Please ensure it\'s a valid Excel file.');
    }
  }
}

console.log('🚀 Starting Specific Flipkart Excel File Analysis...\n');
analyzeSpecificFlipkartFile();