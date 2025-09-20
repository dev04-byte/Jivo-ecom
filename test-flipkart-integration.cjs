const XLSX = require('xlsx');
const path = require('path');

// Import the parser function directly (simulate)
function parseFlipkartGroceryExcelPO(buffer, uploadedBy) {
  console.log('🔍 Testing Flipkart Excel parsing integration...');

  try {
    // Read Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('✅ Total rows in Excel file:', jsonData.length);

    // Extract header information
    let poNumber = '';
    let supplierName = '';
    let supplierAddress = '';
    let supplierContact = '';
    let supplierEmail = '';
    let supplierGstin = '';
    let billedToAddress = '';
    let billedToGstin = '';
    let shippedToAddress = '';
    let shippedToGstin = '';
    let natureOfSupply = '';
    let natureOfTransaction = '';
    let poExpiryDate;
    let category = '';
    let orderDate;
    let modeOfPayment = '';
    let contractRefId = '';
    let contractVersion = '';
    let creditTerm = '';

    // Extract PO Number and other info from Row 2
    const poRow = jsonData.find((row) => row && row[0] === 'PO#');
    if (poRow && poRow[1]) {
      poNumber = poRow[1].toString().trim();

      // Extract additional info from the same row
      const natureSupplyIndex = poRow.findIndex((cell) => cell === 'Nature Of Supply');
      if (natureSupplyIndex >= 0 && poRow[natureSupplyIndex + 1]) {
        natureOfSupply = poRow[natureSupplyIndex + 1].toString().trim();
      }

      const natureTransactionIndex = poRow.findIndex((cell) => cell === 'Nature of Transaction');
      if (natureTransactionIndex >= 0 && poRow[natureTransactionIndex + 1]) {
        natureOfTransaction = poRow[natureTransactionIndex + 1].toString().trim();
      }

      const poExpiryIndex = poRow.findIndex((cell) => cell === 'PO Expiry');
      if (poExpiryIndex >= 0 && poRow[poExpiryIndex + 1]) {
        poExpiryDate = poRow[poExpiryIndex + 1].toString();
      }

      const categoryIndex = poRow.findIndex((cell) => cell === 'CATEGORY');
      if (categoryIndex >= 0 && poRow[categoryIndex + 1]) {
        category = poRow[categoryIndex + 1].toString().trim();
      }

      const orderDateIndex = poRow.findIndex((cell) => cell === 'ORDER DATE');
      if (orderDateIndex >= 0 && poRow[orderDateIndex + 1]) {
        orderDate = poRow[orderDateIndex + 1].toString();
      }
    }

    // Extract Supplier Information (Row 3)
    const supplierRow = jsonData.find((row) => row && row[0] === 'SUPPLIER NAME');
    if (supplierRow && supplierRow[1]) {
      supplierName = supplierRow[1].toString().trim();
      if (supplierRow[4]) {
        supplierAddress = supplierRow[4].toString().trim();
      }

      const contactIndex = supplierRow.findIndex((cell) => cell === 'SUPPLIER CONTACT');
      if (contactIndex >= 0 && supplierRow[contactIndex + 1]) {
        supplierContact = supplierRow[contactIndex + 1].toString().trim();
      }

      const emailIndex = supplierRow.findIndex((cell) => cell === 'EMAIL');
      if (emailIndex >= 0 && supplierRow[emailIndex + 1]) {
        supplierEmail = supplierRow[emailIndex + 1].toString().trim();
      }
    }

    // Extract Billed by and Shipped from (Row 4)
    const billedByRow = jsonData.find((row) => row && row[0] === 'Billed by');
    if (billedByRow) {
      const gstinIndex = billedByRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedByRow[gstinIndex + 1]) {
        supplierGstin = billedByRow[gstinIndex + 1].toString().trim();
      }

      const shippedFromIndex = billedByRow.findIndex((cell) => cell === 'Shipped From');
      if (shippedFromIndex >= 0 && billedByRow[shippedFromIndex + 1]) {
        shippedToAddress = billedByRow[shippedFromIndex + 1].toString().trim();
      }

      // GSTIN for shipped to (usually after Shipped From address)
      const lastGstinIndex = billedByRow.lastIndexOf('GSTIN');
      if (lastGstinIndex > gstinIndex && billedByRow[lastGstinIndex + 1]) {
        shippedToGstin = billedByRow[lastGstinIndex + 1].toString().trim();
      }
    }

    // Extract Billed To Address (Row 5)
    const billedToRow = jsonData.find((row) => row && row[0] === 'BILLED TO ADDRESS');
    if (billedToRow && billedToRow[2]) {
      billedToAddress = billedToRow[2].toString().trim();

      const gstinIndex = billedToRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedToRow[gstinIndex + 1]) {
        billedToGstin = billedToRow[gstinIndex + 1].toString().trim();
      }

      const shippedToIndex = billedToRow.findIndex((cell) => cell === 'SHIPPED TO ADDRESS');
      if (shippedToIndex >= 0 && billedToRow[shippedToIndex + 1]) {
        shippedToAddress = billedToRow[shippedToIndex + 1].toString().trim();
      }
    }

    // Extract Payment Details (Row 7)
    const paymentRow = jsonData.find((row) => row && row[0] === 'MODE OF PAYMENT');
    if (paymentRow) {
      if (paymentRow[2]) modeOfPayment = paymentRow[2].toString().trim();

      const contractRefIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT REF ID');
      if (contractRefIndex >= 0 && paymentRow[contractRefIndex + 1]) {
        contractRefId = paymentRow[contractRefIndex + 1].toString().trim();
      }

      const contractVersionIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT VERSION');
      if (contractVersionIndex >= 0 && paymentRow[contractVersionIndex + 1]) {
        contractVersion = paymentRow[contractVersionIndex + 1].toString().trim();
      }

      const creditTermIndex = paymentRow.findIndex((cell) => cell === 'CREDIT TERM');
      if (creditTermIndex >= 0 && paymentRow[creditTermIndex + 1]) {
        creditTerm = paymentRow[creditTermIndex + 1].toString().trim();
      }
    }

    // Create header object that matches what frontend expects
    const header = {
      po_number: poNumber,
      supplier_name: supplierName,
      supplier_address: supplierAddress,
      supplier_contact: supplierContact,
      supplier_email: supplierEmail,
      supplier_gstin: supplierGstin,
      billed_to_address: billedToAddress,
      billed_to_gstin: billedToGstin,
      shipped_to_address: shippedToAddress,
      shipped_to_gstin: shippedToGstin,
      nature_of_supply: natureOfSupply,
      nature_of_transaction: natureOfTransaction,
      po_expiry_date: poExpiryDate,
      category: category,
      order_date: orderDate,
      mode_of_payment: modeOfPayment,
      contract_ref_id: contractRefId,
      contract_version: contractVersion,
      credit_term: creditTerm,
      status: 'Open'
    };

    console.log('\n🎯 HEADER DATA FOR FRONTEND PREVIEW:');
    console.log('='.repeat(60));
    console.log('📄 PO Number:', header.po_number);
    console.log('🏢 Supplier Name:', header.supplier_name);
    console.log('📧 Supplier Email:', header.supplier_email);
    console.log('📞 Supplier Contact:', header.supplier_contact);
    console.log('🔢 Supplier GSTIN:', header.supplier_gstin);
    console.log('🗓️  Order Date:', header.order_date);
    console.log('⌛ Expiry Date:', header.po_expiry_date);
    console.log('💳 Mode of Payment:', header.mode_of_payment);
    console.log('📋 Credit Term:', header.credit_term);
    console.log('🏷️  Category:', header.category);
    console.log('🏛️  Billed To Address:', header.billed_to_address);
    console.log('🔢 Billed To GSTIN:', header.billed_to_gstin);
    console.log('🚚 Shipped To Address:', header.shipped_to_address);
    console.log('🔢 Shipped To GSTIN:', header.shipped_to_gstin);
    console.log('📄 Contract Ref ID:', header.contract_ref_id);
    console.log('🔄 Contract Version:', header.contract_version);

    console.log('\n🖥️  FRONTEND FIELD MAPPING CHECK:');
    console.log('='.repeat(60));
    console.log('Order Details:');
    console.log('  PO Number:', header.po_number || 'Not available');
    console.log('  Order Date:', header.order_date || 'Not available');
    console.log('  Expiry Date:', header.po_expiry_date || 'Not available');
    console.log('  Payment Terms:', header.mode_of_payment || header.credit_term || 'Not available');
    console.log('  Currency: INR');
    console.log('  Status:', header.status || 'Open');

    console.log('\nVendor Information:');
    console.log('  Company:', header.supplier_name || 'Not available');
    console.log('  Contact:', header.supplier_contact || 'Not available');
    console.log('  Phone:', header.supplier_contact || 'Not available');
    console.log('  Email:', header.supplier_email || 'Not available');
    console.log('  GST Number:', header.supplier_gstin || 'Not available');
    console.log('  Address:', header.supplier_address || 'Not available');

    console.log('\nBuyer Information:');
    console.log('  Company: Flipkart India Private Limited');
    console.log('  GST Number:', header.billed_to_gstin || 'Not available');
    console.log('  Address:', header.billed_to_address || 'Not available');

    return { header, lines: [] };

  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    throw error;
  }
}

// Test with the actual file
const filePath = "C:\\Users\\singh\\Downloads\\purchase_order_FLFWG06905883 (1).xls";

console.log('🚀 Testing Flipkart Integration with Real Data...');
console.log('📂 File:', filePath);
console.log('');

try {
  const buffer = require('fs').readFileSync(filePath);
  const result = parseFlipkartGroceryExcelPO(buffer, 'test-user');

  console.log('\n✅ INTEGRATION TEST COMPLETE!');
  console.log('📊 Result:', {
    headerFields: Object.keys(result.header).length,
    populatedFields: Object.values(result.header).filter(v => v && v !== '').length
  });

} catch (error) {
  console.error('❌ Integration test failed:', error.message);
}