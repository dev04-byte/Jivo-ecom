import fs from 'fs';
import path from 'path';

// Simple test to parse the Swiggy CSV
async function testSwiggyCSV() {
  try {
    console.log('🔄 Testing Swiggy CSV parsing...');

    // Read the CSV file
    const csvPath = 'C:\\Users\\singh\\Downloads\\PO_1758265329897.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    console.log(`📄 CSV file size: ${csvContent.length} characters`);
    console.log(`📄 First 200 characters:`);
    console.log(csvContent.substring(0, 200));

    // Check if it contains the expected header
    const hasCorrectHeader = csvContent.includes('PoNumber,Entity');
    console.log(`✅ Has correct header: ${hasCorrectHeader}`);

    // Parse the first few lines
    const lines = csvContent.split('\n');
    console.log(`📋 Total lines: ${lines.length}`);
    console.log(`📋 Header line: ${lines[0]}`);
    console.log(`📋 First data line: ${lines[1]}`);

    // Test the CSV detection logic
    const filename = 'PO_1758265329897.csv';
    const isCSV = filename.toLowerCase().endsWith('.csv') ||
                  csvContent.substring(0, 100).includes('PoNumber,Entity');

    console.log(`🔍 CSV detection result: ${isCSV}`);

    // Try importing Papa Parse to test parsing
    const Papa = await import('papaparse');
    const parseResult = Papa.default.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    });

    if (parseResult.errors.length > 0) {
      console.error('❌ CSV parsing errors:', parseResult.errors);
    } else {
      console.log(`✅ Successfully parsed ${parseResult.data.length} rows`);
      console.log(`📋 Sample row:`, parseResult.data[0]);

      // Group by PO Number
      const poGroups = {};
      parseResult.data.forEach(row => {
        const poNumber = row.PoNumber;
        if (poNumber) {
          if (!poGroups[poNumber]) {
            poGroups[poNumber] = [];
          }
          poGroups[poNumber].push(row);
        }
      });

      console.log(`📋 Found ${Object.keys(poGroups).length} distinct PO numbers:`);
      Object.keys(poGroups).forEach(po => {
        console.log(`  - ${po}: ${poGroups[po].length} items`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSwiggyCSV();