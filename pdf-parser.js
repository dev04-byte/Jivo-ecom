import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extracted data from the Blinkit PDF
const purchaseOrderData = {
  // Header Information
  buyer: {
    company: "HANDS ON TRADES PRIVATE LIMITED",
    pan: "AADCH7038R",
    cin: "U51909DL2015FTC285808",
    contact: "Durgesh Giri",
    phone: "+91 9068342018",
    gst: "05AADCH7038R1Z3",
    address: "Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun Nagar Nigam, Dehradun, Uttarakhand-248005"
  },

  vendor: {
    company: "JIVO MART PRIVATE LIMITED",
    pan: "AAFCJ4102J",
    gst: "07AAFCJ4102J1ZS",
    contact: "TANUJ KESWANI",
    phone: "91-9818805452",
    email: "marketplace@jivo.in",
    address: "J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027 . Delhi 110027"
  },

  orderDetails: {
    poNumber: "2172510030918",
    date: "Sept. 10, 2025, 12:38 p.m.",
    poType: "PO",
    vendorNo: "1272",
    currency: "INR",
    paymentTerms: "30 Days",
    expiryDate: "Sept. 20, 2025, 11:59 p.m.",
    deliveryDate: "Sept. 11, 2025, 11:59 p.m."
  },

  // Product Items
  items: [
    {
      itemCode: "10143020",
      hsnCode: "15099090",
      productUPC: "8908002585849",
      productDescription: "Jivo Pomace Olive Oil(Bottle) (1 l)",
      basicCostPrice: 391.43,
      igstPercent: 5.00,
      cessPercent: 0.00,
      addtCess: 0.00,
      taxAmount: 19.57,
      landingRate: 411.00,
      quantity: 70,
      mrp: 1049.00,
      marginPercent: 60.82,
      totalAmount: 28770.00
    },
    {
      itemCode: "10153585",
      hsnCode: "15099090",
      productUPC: "8908002584002",
      productDescription: "Jivo Extra Light Olive Oil (2 l)",
      basicCostPrice: 954.29,
      igstPercent: 5.00,
      cessPercent: 0.00,
      addtCess: 0.00,
      taxAmount: 47.71,
      landingRate: 1002.00,
      quantity: 30,
      mrp: 2799.00,
      marginPercent: 64.20,
      totalAmount: 30060.00
    }
  ],

  summary: {
    totalQuantity: 100,
    totalItems: 2,
    totalWeight: "0.126 tonnes",
    totalAmount: 58830.00,
    cartDiscount: 0.0,
    netAmount: 58830.00
  }
};

// Function to convert to CSV format
function convertToCSV(data) {
  const csvRows = [];

  // Header row
  const headers = [
    'Item Code', 'HSN Code', 'Product UPC', 'Product Description',
    'Basic Cost Price', 'IGST %', 'CESS %', 'ADDT. CESS', 'Tax Amount',
    'Landing Rate', 'Quantity', 'MRP', 'Margin %', 'Total Amount'
  ];
  csvRows.push(headers.join(','));

  // Data rows
  data.items.forEach(item => {
    const row = [
      item.itemCode,
      item.hsnCode,
      item.productUPC,
      `"${item.productDescription}"`, // Wrap in quotes for CSV
      item.basicCostPrice,
      item.igstPercent,
      item.cessPercent,
      item.addtCess,
      item.taxAmount,
      item.landingRate,
      item.quantity,
      item.mrp,
      item.marginPercent,
      item.totalAmount
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Function to create Excel-like format (tab-separated)
function convertToExcel(data) {
  const rows = [];

  // Add PO Header Information
  rows.push('PURCHASE ORDER DETAILS');
  rows.push('');
  rows.push(`PO Number:\t${data.orderDetails.poNumber}`);
  rows.push(`Date:\t${data.orderDetails.date}`);
  rows.push(`Vendor:\t${data.vendor.company}`);
  rows.push(`Buyer:\t${data.buyer.company}`);
  rows.push(`Total Amount:\t${data.summary.totalAmount}`);
  rows.push('');
  rows.push('ITEM DETAILS');

  // Header row
  const headers = [
    'Item Code', 'HSN Code', 'Product UPC', 'Product Description',
    'Basic Cost Price', 'IGST %', 'CESS %', 'ADDT. CESS', 'Tax Amount',
    'Landing Rate', 'Quantity', 'MRP', 'Margin %', 'Total Amount'
  ];
  rows.push(headers.join('\t'));

  // Data rows
  data.items.forEach(item => {
    const row = [
      item.itemCode,
      item.hsnCode,
      item.productUPC,
      item.productDescription,
      item.basicCostPrice,
      item.igstPercent,
      item.cessPercent,
      item.addtCess,
      item.taxAmount,
      item.landingRate,
      item.quantity,
      item.mrp,
      item.marginPercent,
      item.totalAmount
    ];
    rows.push(row.join('\t'));
  });

  // Add summary
  rows.push('');
  rows.push('SUMMARY');
  rows.push(`Total Quantity:\t${data.summary.totalQuantity}`);
  rows.push(`Total Items:\t${data.summary.totalItems}`);
  rows.push(`Total Weight:\t${data.summary.totalWeight}`);
  rows.push(`Total Amount:\t${data.summary.totalAmount}`);
  rows.push(`Net Amount:\t${data.summary.netAmount}`);

  return rows.join('\n');
}

// Function to display preview
function displayPreview(data) {
  console.log('\n=== BLINKIT PURCHASE ORDER PREVIEW ===');
  console.log('\n📋 ORDER DETAILS:');
  console.log(`PO Number: ${data.orderDetails.poNumber}`);
  console.log(`Date: ${data.orderDetails.date}`);
  console.log(`Vendor: ${data.vendor.company}`);
  console.log(`Buyer: ${data.buyer.company}`);

  console.log('\n📦 ITEMS:');
  console.log('─'.repeat(120));
  console.log('Item Code'.padEnd(12) + 'Description'.padEnd(35) + 'Qty'.padEnd(8) + 'MRP'.padEnd(12) + 'Landing Rate'.padEnd(15) + 'Total Amount');
  console.log('─'.repeat(120));

  data.items.forEach(item => {
    console.log(
      item.itemCode.padEnd(12) +
      item.productDescription.substring(0, 32).padEnd(35) +
      item.quantity.toString().padEnd(8) +
      `₹${item.mrp}`.padEnd(12) +
      `₹${item.landingRate}`.padEnd(15) +
      `₹${item.totalAmount}`
    );
  });

  console.log('─'.repeat(120));
  console.log('\n💰 SUMMARY:');
  console.log(`Total Items: ${data.summary.totalItems}`);
  console.log(`Total Quantity: ${data.summary.totalQuantity}`);
  console.log(`Total Weight: ${data.summary.totalWeight}`);
  console.log(`Total Amount: ₹${data.summary.totalAmount}`);
  console.log(`Net Amount: ₹${data.summary.netAmount}`);

  console.log('\n📊 DETAILED BREAKDOWN:');
  data.items.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.productDescription}`);
    console.log(`   Item Code: ${item.itemCode} | HSN: ${item.hsnCode}`);
    console.log(`   Basic Price: ₹${item.basicCostPrice} | Tax: ₹${item.taxAmount} | Landing Rate: ₹${item.landingRate}`);
    console.log(`   Quantity: ${item.quantity} | MRP: ₹${item.mrp} | Margin: ${item.marginPercent}%`);
    console.log(`   Total: ₹${item.totalAmount}`);
  });
}

// Main execution
function main() {
  try {
    // Display preview
    displayPreview(purchaseOrderData);

    // Generate CSV
    const csvContent = convertToCSV(purchaseOrderData);
    const csvPath = path.join(__dirname, 'blinkit_purchase_order.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`\n✅ CSV file created: ${csvPath}`);

    // Generate Excel format (TSV)
    const excelContent = convertToExcel(purchaseOrderData);
    const excelPath = path.join(__dirname, 'blinkit_purchase_order.xlsx');
    fs.writeFileSync(excelPath, excelContent, 'utf8');
    console.log(`✅ Excel file created: ${excelPath}`);

    console.log('\n🎉 Data extraction and conversion completed successfully!');
    console.log('\nFiles created:');
    console.log(`📄 CSV: ${csvPath}`);
    console.log(`📊 Excel: ${excelPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export for use in other modules
export {
  purchaseOrderData,
  convertToCSV,
  convertToExcel,
  displayPreview
};

// Run the main function
main();