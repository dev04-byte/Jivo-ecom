import fs from 'fs';
import { parseCityMallPO } from './server/citymall-parser';

// Path to the Excel file
const filePath = 'C:\\Users\\singh\\Downloads\\Purchase Order PO-1357102 (2).xlsx';

async function testCityMallExcelParser() {
  try {
    console.log('Testing CityMall Excel Parser with file:', filePath);
    console.log('==================================================\n');

    // Read the file
    const buffer = fs.readFileSync(filePath);

    // Parse the file
    const result = await parseCityMallPO(buffer, 'test-user');

    console.log('\n=== PARSING RESULTS ===\n');

    // Display header information
    console.log('HEADER INFORMATION:');
    console.log('-------------------');
    console.log('PO Number:', result.header.po_number);
    console.log('PO Date:', result.header.po_date);
    console.log('PO Expiry Date:', result.header.po_expiry_date);
    console.log('Vendor Name:', result.header.vendor_name);
    console.log('Vendor GSTIN:', result.header.vendor_gstin);
    console.log('Vendor Code:', result.header.vendor_code);
    console.log('Status:', result.header.status);
    console.log('Total Quantity:', result.header.total_quantity);
    console.log('Total Base Amount:', result.header.total_base_amount);
    console.log('Total IGST Amount:', result.header.total_igst_amount);
    console.log('Total CESS Amount:', result.header.total_cess_amount);
    console.log('Total Amount:', result.header.total_amount);
    console.log('Unique HSN Codes:', result.header.unique_hsn_codes);

    console.log('\n\nLINE ITEMS SUMMARY:');
    console.log('-------------------');
    console.log('Total Line Items Found:', result.lines.length);
    const totalQuantity = result.lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
    const totalAmount = result.lines.reduce((sum, line) => sum + parseFloat(line.total_amount || '0'), 0);
    console.log('Total Quantity:', totalQuantity);
    console.log('Total Amount:', totalAmount);

    // Display first 5 line items as sample
    console.log('\n\nFIRST 5 LINE ITEMS:');
    console.log('-------------------');
    for (let i = 0; i < Math.min(5, result.lines.length); i++) {
      const line = result.lines[i];
      console.log(`\nItem ${line.line_number}:`);
      console.log('  Article ID:', line.article_id);
      console.log('  Article Name:', line.article_name);
      console.log('  HSN Code:', line.hsn_code);
      console.log('  MRP:', line.mrp);
      console.log('  Base Cost Price:', line.base_cost_price);
      console.log('  Quantity:', line.quantity);
      console.log('  Base Amount:', line.base_amount);
      console.log('  IGST %:', line.igst_percent);
      console.log('  CESS %:', line.cess_percent);
      console.log('  IGST Amount:', line.igst_amount);
      console.log('  CESS Amount:', line.cess_amount);
      console.log('  Total Amount:', line.total_amount);
    }

    // Display last 5 line items to verify all items are captured
    if (result.lines.length > 5) {
      console.log('\n\nLAST 5 LINE ITEMS:');
      console.log('-------------------');
      const startIndex = Math.max(0, result.lines.length - 5);
      for (let i = startIndex; i < result.lines.length; i++) {
        const line = result.lines[i];
        console.log(`\nItem ${line.line_number}:`);
        console.log('  Article ID:', line.article_id);
        console.log('  Article Name:', line.article_name);
        console.log('  HSN Code:', line.hsn_code);
        console.log('  MRP:', line.mrp);
        console.log('  Base Cost Price:', line.base_cost_price);
        console.log('  Quantity:', line.quantity);
        console.log('  Base Amount:', line.base_amount);
        console.log('  Total Amount:', line.total_amount);
      }
    }

    console.log('\n\n=== VERIFICATION ===');
    console.log('Line items captured:', result.lines.length > 0 ? '✓ YES' : '✗ NO');
    console.log('PO Number extracted:', result.header.po_number ? '✓ YES' : '✗ NO');
    console.log('Dates extracted:', (result.header.po_date && result.header.po_expiry_date) ? '✓ YES' : '✗ NO');
    console.log('Vendor info extracted:', result.header.vendor_name ? '✓ YES' : '✗ NO');
    console.log('HSN codes extracted:', result.header.unique_hsn_codes && result.header.unique_hsn_codes.length > 0 ? '✓ YES' : '✗ NO');

    // Verify specific line items exist
    console.log('\n\nSPECIFIC ITEM VERIFICATION:');
    const firstItem = result.lines.find(l => l.line_number === 1);
    const lastItem = result.lines[result.lines.length - 1];

    if (firstItem) {
      console.log('First item (Jivo Groundnut Oil):', firstItem.article_name?.includes('Groundnut') ? '✓ Correct Name' : `✗ Wrong Name: ${firstItem.article_name}`);
      console.log('First item quantity:', firstItem.quantity === 160 ? '✓ Correct Qty (160)' : `✗ Wrong Qty: ${firstItem.quantity}`);
    }

    if (lastItem) {
      console.log('Last item extracted:', lastItem.article_name ? '✓ YES' : '✗ NO');
    }

    console.log('\n==================================================');
    console.log('TEST COMPLETED SUCCESSFULLY!');

  } catch (error: any) {
    console.error('\n!!! ERROR DURING PARSING !!!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

// Run the test
testCityMallExcelParser();