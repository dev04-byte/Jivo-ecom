import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your Excel file
const excelPath = 'C:\\Users\\singh\\Downloads\\27757119.xlsx';

console.log('Reading BigBasket Excel file:', excelPath);

try {
  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);

  console.log('\n=== WORKBOOK INFO ===');
  console.log('Sheet Names:', workbook.SheetNames);

  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('\n=== FILE STRUCTURE ===');
  console.log('Total Rows:', jsonData.length);
  console.log('First 30 rows preview:\n');

  // Show first 30 rows to understand header structure
  for (let i = 0; i < Math.min(30, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.length > 0) {
      console.log(`Row ${i + 1}:`, row.slice(0, 10).map(cell =>
        cell ? String(cell).substring(0, 50) : '(empty)'
      ));
    }
  }

  // Find where the actual data starts (looking for S.No header)
  let headerRowIndex = -1;
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row && row[0] === 'S.No' && row[1] === 'HSN Code') {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex !== -1) {
    console.log(`\n=== DATA HEADERS FOUND AT ROW ${headerRowIndex + 1} ===`);
    const headers = jsonData[headerRowIndex];
    console.log('Column Headers:', headers);
    console.log('Total Columns:', headers.length);

    // Show all line items
    console.log('\n=== ALL LINE ITEMS ===');
    let itemCount = 0;
    let totalQuantity = 0;
    let totalValue = 0;

    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 10) continue;

      // Check if this is a valid data row
      const sNo = parseInt(String(row[0] || ''));
      if (isNaN(sNo) || sNo <= 0) continue;

      itemCount++;
      const quantity = parseInt(String(row[6] || '0')) || 0;
      const value = parseFloat(String(row[22] || '0')) || 0;

      totalQuantity += quantity;
      totalValue += value;

      console.log(`\nItem ${sNo}:`);
      console.log('  HSN Code:', row[1]);
      console.log('  SKU Code:', row[2]);
      console.log('  Description:', String(row[3] || '').substring(0, 60));
      console.log('  EAN/UPC:', row[4]);
      console.log('  Case Qty:', row[5]);
      console.log('  Quantity:', row[6]);
      console.log('  Basic Cost:', row[7]);
      console.log('  GST Amount:', row[15]);
      console.log('  Landing Cost:', row[20]);
      console.log('  MRP:', row[21]);
      console.log('  Total Value:', row[22]);
    }

    console.log('\n=== SUMMARY ===');
    console.log('Total Line Items:', itemCount);
    console.log('Total Quantity:', totalQuantity);
    console.log('Total Value:', totalValue.toFixed(2));

  } else {
    console.log('\n!!! Could not find data headers (S.No, HSN Code) in the file');

    // Try to find any numeric data
    console.log('\nSearching for numeric patterns...');
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length > 10) {
        const firstCell = String(row[0] || '');
        if (/^\d+$/.test(firstCell)) {
          console.log(`Potential data row at ${i + 1}:`, row.slice(0, 5));
        }
      }
    }
  }

  // Look for PO details in specific locations
  console.log('\n=== EXTRACTED PO DETAILS ===');

  for (let i = 0; i < Math.min(20, jsonData.length); i++) {
    const row = jsonData[i];
    if (!row) continue;

    const firstCell = String(row[0] || '');

    // Check for PO Number
    if (firstCell.includes('PO Number:')) {
      console.log('Found at row', i + 1, ':', firstCell);
      if (row[3]) console.log('  Column D:', row[3]);
      if (row[7]) console.log('  Column H:', row[7]);
    }

    // Check for supplier info
    if (firstCell.includes('Sustainquest') || firstCell.includes('GSTIN')) {
      console.log('Supplier info at row', i + 1, ':', firstCell);
    }

    // Check for warehouse
    if (firstCell.includes('Noida') || firstCell.includes('Warehouse')) {
      console.log('Warehouse at row', i + 1, ':', firstCell);
    }
  }

} catch (error) {
  console.error('Error reading Excel file:', error.message);
  console.error('Stack:', error.stack);
}