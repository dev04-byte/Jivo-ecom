async function testDatabaseOperations() {
  console.log('🔍 TESTING DATABASE OPERATIONS DIRECTLY');
  console.log('='.repeat(50));

  try {
    // Test 1: Check current database state
    console.log('📊 STEP 1: Check Current Database State');
    console.log('-'.repeat(40));

    const initialCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const initialPos = await initialCheck.json();
    console.log(`Initial POs in database: ${initialPos.length}`);

    if (initialPos.length > 0) {
      console.log('Existing POs:');
      initialPos.forEach((po, index) => {
        console.log(`  ${index + 1}. ${po.po_number} (ID: ${po.id}) - ${po.supplier_name}`);
      });
    }

    // Test 2: Make Import API Call with detailed logging
    console.log('\\n🚀 STEP 2: Import API Call with Monitoring');
    console.log('-'.repeat(40));

    const testData = {
      header: {
        po_number: `TEST_PO_${Date.now()}`, // Unique PO number
        supplier_name: "Test Supplier",
        supplier_address: "Test Address",
        supplier_contact: "1234567890",
        supplier_email: "test@test.com",
        supplier_gstin: "TEST123456789",
        billed_to_address: "Test Billing Address",
        billed_to_gstin: "BILL123456789",
        shipped_to_address: "Test Shipping Address",
        shipped_to_gstin: "SHIP123456789",
        nature_of_supply: "Inter-State",
        nature_of_transaction: "Sale",
        po_expiry_date: new Date().toISOString(),
        category: "GROCERY",
        order_date: new Date().toISOString(),
        mode_of_payment: "EFT",
        contract_ref_id: "TEST_CONTRACT",
        contract_version: "1.0",
        credit_term: "30 Days",
        distributor: "",
        area: "",
        city: "",
        region: "",
        state: "",
        dispatch_from: "",
        total_quantity: 100,
        total_taxable_value: "1000.00",
        total_tax_amount: "180.00",
        total_amount: "1180.00",
        status: "Open",
        created_by: "test-user",
        uploaded_by: "test-user"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "12345678",
          fsn_isbn: "TEST_FSN",
          quantity: 100,
          pending_quantity: 100,
          uom: "PCS",
          title: "Test Product",
          brand: "Test Brand",
          type: "Test Type",
          ean: "1234567890123",
          vertical: "GROCERY",
          required_by_date: new Date().toISOString(),
          supplier_mrp: "15.00",
          supplier_price: "10.00",
          taxable_value: "1000.00",
          igst_rate: "18.0",
          igst_amount_per_unit: "180.00",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "180.00",
          total_amount: "1180.00",
          status: "Pending",
          created_by: "test-user"
        }
      ]
    };

    console.log(`Making API call with PO Number: ${testData.header.po_number}`);

    const importResponse = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`Import API Status: ${importResponse.status} ${importResponse.statusText}`);

    const importResult = await importResponse.json();
    console.log('Import Response:', JSON.stringify(importResult, null, 2));

    // Test 3: Immediate check after import
    console.log('\\n🔍 STEP 3: Immediate Database Check');
    console.log('-'.repeat(40));

    const immediateCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const immediatePos = await immediateCheck.json();
    console.log(`POs after import: ${immediatePos.length}`);

    const newPo = immediatePos.find(po => po.po_number === testData.header.po_number);
    if (newPo) {
      console.log('✅ New PO found in database!');
      console.log(`  ID: ${newPo.id}`);
      console.log(`  PO Number: ${newPo.po_number}`);
      console.log(`  Supplier: ${newPo.supplier_name}`);
      console.log(`  Line Items: ${newPo.poLines ? newPo.poLines.length : 'No lines found'}`);

      if (newPo.poLines && newPo.poLines.length > 0) {
        console.log('  First Line Item:');
        const firstLine = newPo.poLines[0];
        console.log(`    Title: ${firstLine.title}`);
        console.log(`    Quantity: ${firstLine.quantity}`);
        console.log(`    Price: ${firstLine.supplier_price}`);
      }
    } else {
      console.log('❌ New PO NOT found in database!');
      console.log('Available POs:');
      immediatePos.forEach((po, index) => {
        console.log(`  ${index + 1}. ${po.po_number} (ID: ${po.id})`);
      });
    }

    // Test 4: Check specific PO by ID (if created)
    if (importResult.id) {
      console.log('\\n🎯 STEP 4: Check by Specific ID');
      console.log('-'.repeat(40));

      try {
        const specificCheck = await fetch(`http://localhost:5000/api/flipkart-grocery-pos/${importResult.id}`);
        if (specificCheck.ok) {
          const specificPo = await specificCheck.json();
          console.log('✅ PO found by ID!');
          console.log(`  Retrieved PO: ${specificPo.po_number}`);
          console.log(`  Line Items: ${specificPo.poLines ? specificPo.poLines.length : 'No lines'}`);
        } else {
          console.log(`❌ Could not fetch PO by ID: ${specificCheck.status}`);
        }
      } catch (error) {
        console.log(`❌ Error fetching by ID: ${error.message}`);
      }
    }

    // Test 5: Wait and check again (in case of delayed commits)
    console.log('\\n⏳ STEP 5: Wait and Check Again (5 seconds)');
    console.log('-'.repeat(40));

    await new Promise(resolve => setTimeout(resolve, 5000));

    const delayedCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const delayedPos = await delayedCheck.json();
    console.log(`POs after delay: ${delayedPos.length}`);

    const delayedPo = delayedPos.find(po => po.po_number === testData.header.po_number);
    if (delayedPo) {
      console.log('✅ PO found after delay!');
    } else {
      console.log('❌ PO still not found after delay');
    }

    console.log('\\n📋 SUMMARY:');
    console.log('-'.repeat(40));
    console.log(`Import API Status: ${importResponse.status === 201 ? '✅ Success' : '❌ Failed'}`);
    console.log(`Database Insertion: ${newPo ? '✅ Success' : '❌ Failed'}`);
    console.log(`Data Persistence: ${delayedPo ? '✅ Success' : '❌ Failed'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting comprehensive database test...');
testDatabaseOperations().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});