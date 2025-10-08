const fs = require('fs');

// Test the Swiggy CSV parsing and database insertion
async function testSwiggyImport() {
  try {
    console.log('🧪 Starting Swiggy import test...');

    // Read the test CSV file
    const csvContent = fs.readFileSync('./test-swiggy-primary-po.csv', 'utf-8');
    console.log('📄 Read CSV file successfully');
    console.log('📏 CSV length:', csvContent.length);
    console.log('📋 First 200 chars:', csvContent.substring(0, 200));

    // Import the parser
    const { parseSwiggyCSVPO } = require('./server/swiggy-csv-parser-new.ts');

    // Parse the CSV
    console.log('🔄 Parsing CSV...');
    const parsedData = parseSwiggyCSVPO(csvContent, 'test-user');

    console.log('✅ Parsing successful!');
    console.log('📊 Parsed data structure:', {
      hasHeader: !!parsedData.header,
      hasLines: !!parsedData.lines,
      linesCount: parsedData.lines ? parsedData.lines.length : 0,
      headerKeys: parsedData.header ? Object.keys(parsedData.header).slice(0, 10) : [],
      poNumber: parsedData.header ? parsedData.header.po_number : 'N/A',
      grandTotal: parsedData.header ? parsedData.header.grand_total : 'N/A',
      totalAmount: parsedData.header ? parsedData.header.total_amount : 'N/A'
    });

    // Test database insertion
    console.log('🔄 Testing database insertion...');
    const { insertSwiggyPoToDatabase } = require('./server/swiggy-db-operations.ts');

    const swiggyPoData = {
      header: parsedData.header,
      lines: parsedData.lines
    };

    const insertResult = await insertSwiggyPoToDatabase(swiggyPoData);

    console.log('📥 Database insertion result:', {
      success: insertResult.success,
      message: insertResult.message,
      hasData: !!insertResult.data
    });

    if (!insertResult.success) {
      console.error('❌ Database insertion failed:', insertResult.message);
    } else {
      console.log('✅ Database insertion successful!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Stack:', error.stack);
  }
}

// Run the test
testSwiggyImport();