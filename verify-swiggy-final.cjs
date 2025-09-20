const fs = require('fs');
const { parse } = require('csv-parse/sync');

console.log('📋 Verifying Swiggy CSV Data Parsing\n');

const csvPath = 'c:/Users/singh/Downloads/PCHPO141863.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  quote: '"',
  escape: '"',
  relax_column_count: true
});

console.log('✅ Successfully parsed', records.length, 'records\n');

// Get header from first row
const firstRow = records[0];
console.log('📌 Header Information:');
console.log('  PO Number:', firstRow.PoNumber);
console.log('  Entity:', firstRow.Entity);
console.log('  Facility:', firstRow.FacilityName, '(' + firstRow.FacilityId + ')');
console.log('  City:', firstRow.City);
console.log('  Vendor:', firstRow.VendorName);
console.log('  Supplier Code:', firstRow.SupplierCode);
console.log('  Status:', firstRow.Status);
console.log('  PO Amount:', firstRow.PoAmount);

// Calculate totals
let totalQty = 0;
let totalAmount = 0;

console.log('\n📦 Line Items:');
records.forEach((row, index) => {
  const qty = parseInt(row.OrderedQty || '0');
  const lineTotal = parseFloat(row.PoLineValueWithTax || '0');
  totalQty += qty;
  totalAmount += lineTotal;

  console.log(`\nItem ${index + 1}:`);
  console.log('  SKU Code:', row.SkuCode);
  console.log('  Description:', row.SkuDescription);
  console.log('  Category:', row.CategoryId);
  console.log('  Brand:', row.BrandName);
  console.log('  Ordered Qty:', row.OrderedQty);
  console.log('  Received Qty:', row.ReceivedQty);
  console.log('  Balanced Qty:', row.BalancedQty);
  console.log('  MRP: ₹' + row.Mrp);
  console.log('  Unit Cost: ₹' + row.UnitBasedCost);
  console.log('  Tax: ₹' + row.Tax);
  console.log('  Line Value (without tax): ₹' + row.PoLineValueWithoutTax);
  console.log('  Line Total (with tax): ₹' + row.PoLineValueWithTax);
});

console.log('\n📊 Summary:');
console.log('  Total Items:', records.length);
console.log('  Total Quantity:', totalQty);
console.log('  Calculated Total: ₹' + totalAmount.toFixed(2));
console.log('  Expected PO Amount: ₹' + firstRow.PoAmount);
console.log('  Match:', totalAmount.toFixed(2) === parseFloat(firstRow.PoAmount).toFixed(2) ? '✅ Yes' : '❌ No');

console.log('\n✅ Data structure verified!');