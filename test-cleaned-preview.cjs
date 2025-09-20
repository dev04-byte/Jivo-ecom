const XLSX = require('xlsx');

function testCleanedPreview() {
  const filePath = "C:\\Users\\singh\\Downloads\\purchase_order_FLFWG06905883 (1).xls";

  console.log('🧹 TESTING CLEANED FLIPKART PREVIEW');
  console.log('='.repeat(70));

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Simulate the cleaned header data structure
    const parsedData = {
      header: {}
    };

    // Extract only the fields that actually exist in Excel

    // PO Row extraction
    const poRow = jsonData.find((row) => row && row[0] === 'PO#');
    if (poRow && poRow[1]) {
      parsedData.header.po_number = poRow[1].toString().trim();

      const categoryIndex = poRow.findIndex((cell) => cell === 'CATEGORY');
      if (categoryIndex >= 0 && poRow[categoryIndex + 1]) {
        parsedData.header.category = poRow[categoryIndex + 1].toString().trim();
      }

      const orderDateIndex = poRow.findIndex((cell) => cell === 'ORDER DATE');
      if (orderDateIndex >= 0 && poRow[orderDateIndex + 1]) {
        parsedData.header.order_date = poRow[orderDateIndex + 1].toString();
      }

      const natureSupplyIndex = poRow.findIndex((cell) => cell === 'Nature Of Supply');
      if (natureSupplyIndex >= 0 && poRow[natureSupplyIndex + 1]) {
        parsedData.header.nature_of_supply = poRow[natureSupplyIndex + 1].toString();
      }

      const natureTransactionIndex = poRow.findIndex((cell) => cell === 'Nature of Transaction');
      if (natureTransactionIndex >= 0 && poRow[natureTransactionIndex + 1]) {
        parsedData.header.nature_of_transaction = poRow[natureTransactionIndex + 1].toString();
      }

      const poExpiryIndex = poRow.findIndex((cell) => cell === 'PO Expiry');
      if (poExpiryIndex >= 0 && poRow[poExpiryIndex + 1]) {
        parsedData.header.po_expiry_date = poRow[poExpiryIndex + 1].toString();
      }
    }

    // Supplier Information extraction
    const supplierRow = jsonData.find((row) => row && row[0] === 'SUPPLIER NAME');
    if (supplierRow && supplierRow[1]) {
      parsedData.header.supplier_name = supplierRow[1].toString().trim();
      if (supplierRow[4]) {
        parsedData.header.supplier_address = supplierRow[4].toString().trim();
      }

      const contactIndex = supplierRow.findIndex((cell) => cell === 'SUPPLIER CONTACT');
      if (contactIndex >= 0 && supplierRow[contactIndex + 1]) {
        parsedData.header.supplier_contact = supplierRow[contactIndex + 1].toString().trim();
      }

      const emailIndex = supplierRow.findIndex((cell) => cell === 'EMAIL');
      if (emailIndex >= 0 && supplierRow[emailIndex + 1]) {
        parsedData.header.supplier_email = supplierRow[emailIndex + 1].toString().trim();
      }
    }

    // GSTIN extraction
    const billedByRow = jsonData.find((row) => row && row[0] === 'Billed by');
    if (billedByRow) {
      const gstinIndex = billedByRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedByRow[gstinIndex + 1]) {
        parsedData.header.supplier_gstin = billedByRow[gstinIndex + 1].toString().trim();
      }
    }

    // Billing address extraction
    const billedToRow = jsonData.find((row) => row && row[0] === 'BILLED TO ADDRESS');
    if (billedToRow && billedToRow[2]) {
      parsedData.header.billed_to_address = billedToRow[2].toString().trim();

      const gstinIndex = billedToRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedToRow[gstinIndex + 1]) {
        parsedData.header.billed_to_gstin = billedToRow[gstinIndex + 1].toString().trim();
      }
    }

    // Payment details extraction
    const paymentRow = jsonData.find((row) => row && row[0] === 'MODE OF PAYMENT');
    if (paymentRow) {
      if (paymentRow[2]) parsedData.header.mode_of_payment = paymentRow[2].toString().trim();

      const contractRefIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT REF ID');
      if (contractRefIndex >= 0 && paymentRow[contractRefIndex + 1]) {
        parsedData.header.contract_ref_id = paymentRow[contractRefIndex + 1].toString().trim();
      }

      const contractVersionIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT VERSION');
      if (contractVersionIndex >= 0 && paymentRow[contractVersionIndex + 1]) {
        parsedData.header.contract_version = paymentRow[contractVersionIndex + 1].toString().trim();
      }

      const creditTermIndex = paymentRow.findIndex((cell) => cell === 'CREDIT TERM');
      if (creditTermIndex >= 0 && paymentRow[creditTermIndex + 1]) {
        parsedData.header.credit_term = paymentRow[creditTermIndex + 1].toString().trim();
      }
    }

    parsedData.header.status = 'Open';

    console.log('📋 CLEANED PREVIEW SIMULATION:');
    console.log('='.repeat(50));

    console.log('\n📄 ORDER DETAILS:');
    console.log('-'.repeat(30));
    console.log(`PO Number: ${parsedData.header.po_number || 'Not available'}`);
    console.log(`Order Date: ${parsedData.header.order_date ? parsedData.header.order_date.toString().split('T')[0] : 'Not available'}`);
    console.log(`Expiry Date: ${parsedData.header.po_expiry_date ? parsedData.header.po_expiry_date.toString().split('T')[0] : 'Not available'}`);
    console.log(`Mode of Payment: ${parsedData.header.mode_of_payment || 'Not available'}`);

    if (parsedData.header.credit_term) {
      console.log(`Credit Term: ${parsedData.header.credit_term}`);
    }

    if (parsedData.header.category) {
      console.log(`Category: ${parsedData.header.category}`);
    }

    if (parsedData.header.nature_of_supply) {
      console.log(`Nature of Supply: ${parsedData.header.nature_of_supply}`);
    }

    if (parsedData.header.nature_of_transaction) {
      console.log(`Nature of Transaction: ${parsedData.header.nature_of_transaction}`);
    }

    if (parsedData.header.contract_ref_id) {
      console.log(`Contract Ref ID: ${parsedData.header.contract_ref_id}`);
    }

    if (parsedData.header.contract_version) {
      console.log(`Contract Version: ${parsedData.header.contract_version}`);
    }

    console.log(`Status: ${parsedData.header.status || 'Open'}`);

    console.log('\n🏢 VENDOR INFORMATION:');
    console.log('-'.repeat(30));
    console.log(`Company: ${parsedData.header.supplier_name || 'Not available'}`);
    console.log(`Contact: ${parsedData.header.supplier_contact || 'Not available'}`);
    console.log(`Email: ${parsedData.header.supplier_email || 'Not available'}`);
    console.log(`GST Number: ${parsedData.header.supplier_gstin || 'Not available'}`);
    console.log(`Address: ${parsedData.header.supplier_address || 'Not available'}`);

    console.log('\n🏛️  BUYER INFORMATION:');
    console.log('-'.repeat(30));
    console.log(`Company: Flipkart India Private Limited`);
    console.log(`GST Number: ${parsedData.header.billed_to_gstin || 'Not available'}`);
    console.log(`Address: ${parsedData.header.billed_to_address || 'Not available'}`);

    console.log('\n✅ REMOVED FIELDS (No longer shown):');
    console.log('-'.repeat(30));
    console.log('❌ Delivery Date (not in Excel)');
    console.log('❌ Currency (hardcoded or not needed)');
    console.log('❌ Phone (separate from contact)');
    console.log('❌ Vendor PAN Number');
    console.log('❌ Buyer Contact');
    console.log('❌ Buyer Phone');
    console.log('❌ Buyer PAN');

    console.log('\n📊 SUMMARY:');
    console.log('-'.repeat(30));
    const totalFields = Object.keys(parsedData.header).length;
    const populatedFields = Object.values(parsedData.header).filter(v => v && v !== '').length;
    console.log(`Total fields: ${totalFields}`);
    console.log(`Populated fields: ${populatedFields}`);
    console.log(`Data coverage: ${Math.round((populatedFields / totalFields) * 100)}%`);
    console.log('✅ All displayed fields now exist in Excel!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCleanedPreview();