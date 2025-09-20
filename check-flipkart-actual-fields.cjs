const XLSX = require('xlsx');

function checkActualFlipkartFields() {
  const filePath = "C:\\Users\\singh\\Downloads\\purchase_order_FLFWG06905883 (1).xls";

  console.log('🔍 CHECKING ACTUAL FIELDS IN FLIPKART EXCEL');
  console.log('='.repeat(70));

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📊 Total rows:', jsonData.length);
    console.log('');

    // Fields that exist in Excel vs fields shown in preview
    const actualFields = {
      // From our analysis, these are the ACTUAL fields in Flipkart Excel:
      po_number: '',
      supplier_name: '',
      supplier_address: '',
      supplier_contact: '',
      supplier_email: '',
      supplier_gstin: '',
      billed_to_address: '',
      billed_to_gstin: '',
      shipped_to_address: '',
      shipped_to_gstin: '',
      nature_of_supply: '',
      nature_of_transaction: '',
      po_expiry_date: '',
      category: '',
      order_date: '',
      mode_of_payment: '',
      contract_ref_id: '',
      contract_version: '',
      credit_term: ''
    };

    const previewFields = {
      // Fields currently shown in the preview component:
      // Order Details Section
      'PO Number': 'po_number',
      'Order Date': 'po_date || order_date',
      'Delivery Date': 'po_delivery_date || required_by_date',
      'Expiry Date': 'po_expiry_date',
      'Payment Terms': 'payment_terms || mode_of_payment || credit_term',
      'Currency': 'currency (hardcoded INR)',
      'Status': 'status (hardcoded Open)',

      // Vendor Information Section
      'Company': 'vendor_name || supplier_name',
      'Contact': 'vendor_contact_name || supplier_contact',
      'Phone': 'vendor_contact_phone || supplier_contact',
      'Email': 'vendor_contact_email || supplier_email',
      'GST Number': 'vendor_gst_no || supplier_gstin',
      'PAN Number': 'vendor_pan',
      'Address': 'vendor_registered_address || supplier_address',

      // Buyer Information Section
      'Company (Buyer)': 'buyer_name || hardcoded Flipkart',
      'Contact (Buyer)': 'buyer_contact',
      'Phone (Buyer)': 'buyer_phone',
      'GST Number (Buyer)': 'buyer_gst || billed_to_gstin',
      'PAN Number (Buyer)': 'buyer_pan',
      'Address (Buyer)': 'buyer_address || billed_to_address'
    };

    console.log('📋 FIELDS THAT EXIST IN EXCEL:');
    console.log('-'.repeat(50));

    // Extract actual data to see what's populated
    let extractedData = {};

    // Extract PO Number
    const poRow = jsonData.find((row) => row && row[0] === 'PO#');
    if (poRow && poRow[1]) {
      extractedData.po_number = poRow[1].toString().trim();

      // Check for other fields in the same row
      const categoryIndex = poRow.findIndex((cell) => cell === 'CATEGORY');
      if (categoryIndex >= 0 && poRow[categoryIndex + 1]) {
        extractedData.category = poRow[categoryIndex + 1].toString().trim();
      }

      const orderDateIndex = poRow.findIndex((cell) => cell === 'ORDER DATE');
      if (orderDateIndex >= 0 && poRow[orderDateIndex + 1]) {
        extractedData.order_date = poRow[orderDateIndex + 1].toString();
      }

      const natureSupplyIndex = poRow.findIndex((cell) => cell === 'Nature Of Supply');
      if (natureSupplyIndex >= 0 && poRow[natureSupplyIndex + 1]) {
        extractedData.nature_of_supply = poRow[natureSupplyIndex + 1].toString();
      }

      const natureTransactionIndex = poRow.findIndex((cell) => cell === 'Nature of Transaction');
      if (natureTransactionIndex >= 0 && poRow[natureTransactionIndex + 1]) {
        extractedData.nature_of_transaction = poRow[natureTransactionIndex + 1].toString();
      }

      const poExpiryIndex = poRow.findIndex((cell) => cell === 'PO Expiry');
      if (poExpiryIndex >= 0 && poRow[poExpiryIndex + 1]) {
        extractedData.po_expiry_date = poRow[poExpiryIndex + 1].toString();
      }
    }

    // Extract Supplier Information
    const supplierRow = jsonData.find((row) => row && row[0] === 'SUPPLIER NAME');
    if (supplierRow && supplierRow[1]) {
      extractedData.supplier_name = supplierRow[1].toString().trim();
      if (supplierRow[4]) {
        extractedData.supplier_address = supplierRow[4].toString().trim();
      }

      const contactIndex = supplierRow.findIndex((cell) => cell === 'SUPPLIER CONTACT');
      if (contactIndex >= 0 && supplierRow[contactIndex + 1]) {
        extractedData.supplier_contact = supplierRow[contactIndex + 1].toString().trim();
      }

      const emailIndex = supplierRow.findIndex((cell) => cell === 'EMAIL');
      if (emailIndex >= 0 && supplierRow[emailIndex + 1]) {
        extractedData.supplier_email = supplierRow[emailIndex + 1].toString().trim();
      }
    }

    // Extract GSTIN and other details
    const billedByRow = jsonData.find((row) => row && row[0] === 'Billed by');
    if (billedByRow) {
      const gstinIndex = billedByRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedByRow[gstinIndex + 1]) {
        extractedData.supplier_gstin = billedByRow[gstinIndex + 1].toString().trim();
      }
    }

    // Extract billing address
    const billedToRow = jsonData.find((row) => row && row[0] === 'BILLED TO ADDRESS');
    if (billedToRow && billedToRow[2]) {
      extractedData.billed_to_address = billedToRow[2].toString().trim();

      const gstinIndex = billedToRow.findIndex((cell) => cell === 'GSTIN');
      if (gstinIndex >= 0 && billedToRow[gstinIndex + 1]) {
        extractedData.billed_to_gstin = billedToRow[gstinIndex + 1].toString().trim();
      }
    }

    // Extract payment details
    const paymentRow = jsonData.find((row) => row && row[0] === 'MODE OF PAYMENT');
    if (paymentRow) {
      if (paymentRow[2]) extractedData.mode_of_payment = paymentRow[2].toString().trim();

      const contractRefIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT REF ID');
      if (contractRefIndex >= 0 && paymentRow[contractRefIndex + 1]) {
        extractedData.contract_ref_id = paymentRow[contractRefIndex + 1].toString().trim();
      }

      const contractVersionIndex = paymentRow.findIndex((cell) => cell === 'CONTRACT VERSION');
      if (contractVersionIndex >= 0 && paymentRow[contractVersionIndex + 1]) {
        extractedData.contract_version = paymentRow[contractVersionIndex + 1].toString().trim();
      }

      const creditTermIndex = paymentRow.findIndex((cell) => cell === 'CREDIT TERM');
      if (creditTermIndex >= 0 && paymentRow[creditTermIndex + 1]) {
        extractedData.credit_term = paymentRow[creditTermIndex + 1].toString().trim();
      }
    }

    // Display what actually exists
    Object.keys(extractedData).forEach(key => {
      const value = extractedData[key];
      console.log(`✅ ${key}: "${value}"`);
    });

    console.log('\n❌ FIELDS SHOWN IN PREVIEW BUT NOT IN EXCEL:');
    console.log('-'.repeat(50));

    const fieldsNotInExcel = [
      'Delivery Date (po_delivery_date)',
      'Currency (hardcoded, not from Excel)',
      'PAN Number (vendor_pan) - not in Flipkart Excel',
      'Phone (separate from contact)',
      'Buyer Contact - not in Excel',
      'Buyer Phone - not in Excel',
      'Buyer PAN - not in Excel',
      'Shipped To Address - exists but rarely populated',
      'Shipped To GSTIN - exists but rarely populated'
    ];

    fieldsNotInExcel.forEach(field => {
      console.log(`❌ ${field}`);
    });

    console.log('\n🎯 RECOMMENDED FIELDS TO KEEP IN PREVIEW:');
    console.log('-'.repeat(50));

    const fieldsToKeep = [
      'PO Number ✅',
      'Order Date ✅',
      'Expiry Date ✅',
      'Payment Terms (Mode of Payment) ✅',
      'Credit Term ✅',
      'Category ✅',
      'Nature of Supply ✅',
      'Nature of Transaction ✅',
      'Contract Ref ID ✅',
      'Contract Version ✅',
      'Supplier Name ✅',
      'Supplier Contact ✅',
      'Supplier Email ✅',
      'Supplier GSTIN ✅',
      'Supplier Address ✅',
      'Billed To Address ✅',
      'Billed To GSTIN ✅'
    ];

    fieldsToKeep.forEach(field => {
      console.log(`${field}`);
    });

    console.log('\n🗑️  FIELDS TO REMOVE FROM PREVIEW:');
    console.log('-'.repeat(50));

    const fieldsToRemove = [
      '❌ Delivery Date (not in Flipkart Excel)',
      '❌ Currency (hardcoded, remove or keep as hardcoded INR)',
      '❌ Vendor PAN Number',
      '❌ Buyer Contact',
      '❌ Buyer Phone',
      '❌ Buyer PAN',
      '❌ Phone (separate field - use Contact field)',
      '❌ Shipped To Address (rarely populated)',
      '❌ Shipped To GSTIN (rarely populated)'
    ];

    fieldsToRemove.forEach(field => {
      console.log(field);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActualFlipkartFields();