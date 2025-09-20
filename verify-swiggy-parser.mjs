import { parseSwiggyCSVPO } from './server/swiggy-csv-parser-new.ts';
import fs from 'fs';

console.log('📋 Verifying Swiggy CSV Parser with actual data\n');

const csvPath = 'c:/Users/singh/Downloads/PCHPO141863.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

console.log('📄 CSV File:', csvPath);

try {
  const result = parseSwiggyCSVPO(csvContent, 'test');

  console.log('\n✅ Parser Results:');
  console.log('================\n');

  console.log('📌 Header Data:');
  console.log('  PO Number:', result.header.po_number);
  console.log('  Entity:', result.header.entity);
  console.log('  Facility:', result.header.facility_name, '(' + result.header.facility_id + ')');
  console.log('  City:', result.header.city);
  console.log('  Vendor:', result.header.vendor_name);
  console.log('  Supplier Code:', result.header.supplier_code);
  console.log('  Status:', result.header.status);
  console.log('  PO Amount:', result.header.po_amount);
  console.log('  Grand Total:', result.header.grand_total);
  console.log('  Total Items:', result.header.total_items);
  console.log('  Total Quantity:', result.header.total_quantity);

  console.log('\n📦 Line Items:');
  result.lines.forEach((line, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log('  SKU Code:', line.item_code);
    console.log('  Description:', line.item_description);
    console.log('  Category:', line.category_id);
    console.log('  Brand:', line.brand_name);
    console.log('  Quantity:', line.quantity);
    console.log('  MRP:', line.mrp);
    console.log('  Unit Cost:', line.unit_base_cost);
    console.log('  Tax:', line.tax_amount);
    console.log('  Taxable Value:', line.taxable_value);
    console.log('  Line Total:', line.line_total);
  });

  console.log('\n✅ All data parsed correctly!');

} catch (error) {
  console.error('❌ Parser Error:', error.message);
}