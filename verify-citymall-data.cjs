const xlsx = require('xlsx');
const fs = require('fs');

function verifyParsing() {
  console.log('📊 Verifying CityMall Data Extraction\n');
  console.log('='.repeat(80));

  const filePath = 'c:\\Users\\singh\\Downloads\\PO-1359161.xlsx';
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

  console.log('\n📋 HEADER EXTRACTION TEST:');
  console.log('-'.repeat(80));

  // Test PO Number extraction from Row 1, Column 18
  const row1 = jsonData[0];
  const poCell = row1[17]; // Column 18, index 17
  console.log('PO Number cell (Row 1, Col 18):', poCell);
  const poMatch = String(poCell).match(/PO-(\d+)/);
  console.log('Extracted PO Number:', poMatch ? poMatch[1] : 'NOT FOUND');

  // Test Buyer info (Columns 2-4)
  const buyerNameRow = jsonData[1]; // Row 2
  console.log('\nBuyer Name (Row 2, Col 4):', buyerNameRow[3]);

  const buyerGstRow = jsonData[2]; // Row 3
  console.log('Buyer GST (Row 3, Col 4):', buyerGstRow[3]);

  // Test Vendor info (Columns 16-19)
  const vendorNameRow = jsonData[1]; // Row 2
  console.log('\nVendor Name (Row 2, Col 19):', vendorNameRow[18]);

  const vendorCodeRow = jsonData[2]; // Row 3
  console.log('Vendor Code (Row 3, Col 19):', vendorCodeRow[18]);

  const vendorGstRow = jsonData[3]; // Row 4
  console.log('Vendor GST (Row 4, Col 19):', vendorGstRow[18]);

  const contactRow = jsonData[4]; // Row 5
  console.log('Contact Person (Row 5, Col 19):', contactRow[18]);

  const phoneRow = jsonData[8]; // Row 9
  console.log('Vendor Phone (Row 9, Col 19):', phoneRow[18]);

  console.log('\n\n📦 LINE ITEMS EXTRACTION TEST:');
  console.log('-'.repeat(80));
  console.log('Header Row (Row 11):', jsonData[10].filter(c => c !== ''));

  // Test first 3 line items
  for (let i = 11; i <= 13; i++) {
    const row = jsonData[i];
    console.log(`\nRow ${i + 1} (Item ${i - 10}):`);
    console.log('  [0] S.No:', row[0]);
    console.log('  [2] Article Id:', row[2]);
    console.log('  [5] Article Name:', row[5]);
    console.log('  [9] HSN Code:', row[9]);
    console.log('  [11] MRP:', row[11]);
    console.log('  [12] Base Cost:', row[12]);
    console.log('  [16] Quantity:', row[16]);
    console.log('  [17] Base Amount:', row[17]);
    console.log('  [19] IGST/CESS %:', row[19]);
    console.log('  [21] IGST/CESS Amt:', row[21]);
    console.log('  [23] Total Amount:', row[23]);

    // Verify parsing
    if (row[19] && row[19].includes('\n')) {
      const rates = row[19].split('\n');
      console.log('  → IGST %:', rates[0], ', CESS %:', rates[1]);
    }
    if (row[21] && row[21].includes('\n')) {
      const amounts = row[21].split('\n');
      console.log('  → IGST Amt:', amounts[0], ', CESS Amt:', amounts[1]);
    }
  }

  console.log('\n\n✅ VERIFICATION SUMMARY:');
  console.log('='.repeat(80));

  let allGood = true;
  const item1 = jsonData[11];

  // Check critical fields
  const checks = [
    { name: 'PO Number exists', value: poMatch && poMatch[1], expected: '1359161' },
    { name: 'Vendor Name', value: vendorNameRow[18], expected: 'JIVO MART PRIVATE LIMITED' },
    { name: 'Item 1 Article ID', value: item1[2], expected: 'CM02456486' },
    { name: 'Item 1 Quantity', value: item1[16], expected: '260' },
    { name: 'Item 1 Base Amount', value: item1[17], expected: '31200.00' },
    { name: 'Item 1 Total', value: item1[23], expected: '32760.00' }
  ];

  checks.forEach(check => {
    const pass = String(check.value).trim() === String(check.expected).trim();
    console.log(`${pass ? '✅' : '❌'} ${check.name}: ${check.value} ${!pass ? `(expected: ${check.expected})` : ''}`);
    if (!pass) allGood = false;
  });

  console.log('\n' + '='.repeat(80));
  if (allGood) {
    console.log('✅ ALL CHECKS PASSED! Parser should work correctly.');
  } else {
    console.log('⚠️  Some checks failed. Parser may need adjustments.');
  }

  // Calculate totals
  console.log('\n📊 CALCULATED TOTALS:');
  console.log('-'.repeat(80));
  let totalQty = 0;
  let totalBase = 0;
  let totalAmt = 0;
  let itemCount = 0;

  for (let i = 11; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row[0] || String(row[0]).toLowerCase() === 'total') break;

    const qty = parseFloat(row[16] || 0);
    const base = parseFloat(String(row[17] || 0).replace(/,/g, ''));
    const total = parseFloat(String(row[23] || 0).replace(/,/g, ''));

    if (qty > 0) {
      itemCount++;
      totalQty += qty;
      totalBase += base;
      totalAmt += total;
    }
  }

  console.log('Total Items:', itemCount);
  console.log('Total Quantity:', totalQty);
  console.log('Total Base Amount: ₹', totalBase.toFixed(2));
  console.log('Total Amount: ₹', totalAmt.toFixed(2));
  console.log('\nExpected from Excel (Row 23):');
  console.log('  Base Amount: ₹324910.52');
  console.log('  Total Amount: ₹341156.05');
}

verifyParsing();
