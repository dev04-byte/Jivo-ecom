import fs from 'fs';
import { parseBigBasketPO } from './server/bigbasket-parser';

// Path to the Excel file
const filePath = 'C:\\Users\\singh\\Downloads\\27757119.xlsx';

async function testBigBasketParser() {
  try {
    console.log('Testing BigBasket Parser with file:', filePath);
    console.log('==================================================\n');

    // Read the file
    const buffer = fs.readFileSync(filePath);

    // Parse the file
    const result = await parseBigBasketPO(buffer, 'test-user');

    console.log('\n=== PARSING RESULTS ===\n');

    // Display header information
    console.log('HEADER INFORMATION:');
    console.log('-------------------');
    console.log('PO Number:', result.header.po_number);
    console.log('PO Date:', result.header.po_date);
    console.log('PO Expiry Date:', result.header.po_expiry_date);
    console.log('DC Address:', result.header.dc_address);
    console.log('DC GSTIN:', result.header.dc_gstin);
    console.log('Warehouse Address:', result.header.warehouse_address);
    console.log('Delivery Address:', result.header.delivery_address);
    console.log('Supplier Name:', result.header.supplier_name);
    console.log('Supplier Address:', result.header.supplier_address);
    console.log('Supplier GSTIN:', result.header.supplier_gstin);
    console.log('Total Items:', result.header.total_items);
    console.log('Total Quantity:', result.header.total_quantity);
    console.log('Total Basic Cost:', result.header.total_basic_cost);
    console.log('Total GST Amount:', result.header.total_gst_amount);
    console.log('Total Cess Amount:', result.header.total_cess_amount);
    console.log('Grand Total:', result.header.grand_total);
    console.log('Status:', result.header.status);

    console.log('\n\nLINE ITEMS SUMMARY:');
    console.log('-------------------');
    console.log('Total Line Items Found:', result.lines.length);
    console.log('Total Quantity:', result.totalQuantity);
    console.log('Total Amount:', result.totalAmount);

    // Display first 5 line items as sample
    console.log('\n\nFIRST 5 LINE ITEMS:');
    console.log('-------------------');
    for (let i = 0; i < Math.min(5, result.lines.length); i++) {
      const line = result.lines[i];
      console.log(`\nItem ${line.s_no}:`);
      console.log('  SKU Code:', line.sku_code);
      console.log('  Description:', line.description);
      console.log('  Quantity:', line.quantity);
      console.log('  Basic Cost:', line.basic_cost);
      console.log('  GST Amount:', line.gst_amount);
      console.log('  Total Value:', line.total_value);
    }

    // Display last 5 line items to verify all items are captured
    if (result.lines.length > 5) {
      console.log('\n\nLAST 5 LINE ITEMS:');
      console.log('-------------------');
      const startIndex = Math.max(0, result.lines.length - 5);
      for (let i = startIndex; i < result.lines.length; i++) {
        const line = result.lines[i];
        console.log(`\nItem ${line.s_no}:`);
        console.log('  SKU Code:', line.sku_code);
        console.log('  Description:', line.description);
        console.log('  Quantity:', line.quantity);
        console.log('  Basic Cost:', line.basic_cost);
        console.log('  GST Amount:', line.gst_amount);
        console.log('  Total Value:', line.total_value);
      }
    }

    console.log('\n\n=== VERIFICATION ===');
    console.log('All 24 line items captured:', result.lines.length === 24 ? '✓ YES' : `✗ NO (found ${result.lines.length})`);
    console.log('PO Number extracted:', result.header.po_number ? '✓ YES' : '✗ NO');
    console.log('Dates extracted:', (result.header.po_date && result.header.po_expiry_date) ? '✓ YES' : '✗ NO');
    console.log('Supplier info extracted:', result.header.supplier_gstin ? '✓ YES' : '✗ NO');

    // Verify specific line items
    console.log('\n\nSPECIFIC ITEM VERIFICATION:');
    const item1 = result.lines.find(l => l.s_no === 1);
    const item24 = result.lines.find(l => l.s_no === 24);

    if (item1) {
      console.log('Item 1 (Sunflower Oil):', item1.quantity === 28 ? '✓ Correct Qty' : `✗ Wrong Qty: ${item1.quantity}`);
    }

    if (item24) {
      console.log('Item 24 (Extra Light Olive Oil):', item24.quantity === 20 ? '✓ Correct Qty' : `✗ Wrong Qty: ${item24.quantity}`);
    }

    console.log('\n==================================================');
    console.log('TEST COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n!!! ERROR DURING PARSING !!!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

// Run the test
testBigBasketParser();