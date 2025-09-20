async function testDbConnection() {
  console.log('🔌 TESTING DATABASE CONNECTION AND ISOLATION');
  console.log('='.repeat(60));

  try {
    // Test 1: Check current database state
    console.log('📊 STEP 1: Initial Database State');
    console.log('-'.repeat(40));

    const initialCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const initialPos = await initialCheck.json();
    console.log(`Initial POs: ${initialPos.length}`);

    // Test 2: Import PO and immediately check by ID
    const testPo = `DB_TEST_${Date.now()}`;
    console.log(`\\n🚀 STEP 2: Import PO ${testPo}`);
    console.log('-'.repeat(40));

    const importData = {
      header: {
        po_number: testPo,
        supplier_name: "DB Test Supplier",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "db-test",
        uploaded_by: "db-test",
        // All required fields
        supplier_address: "",
        supplier_contact: "",
        supplier_email: "",
        supplier_gstin: "",
        billed_to_address: "",
        billed_to_gstin: "",
        shipped_to_address: "",
        shipped_to_gstin: "",
        nature_of_supply: "",
        nature_of_transaction: "",
        po_expiry_date: null,
        category: "",
        mode_of_payment: "",
        contract_ref_id: "",
        contract_version: "",
        credit_term: "",
        distributor: "",
        area: "",
        city: "",
        region: "",
        state: "",
        dispatch_from: "",
        total_quantity: 1,
        total_taxable_value: "10.0",
        total_tax_amount: "1.8",
        total_amount: "11.8"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "87654321",
          fsn_isbn: "DB_TEST_FSN",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "DB Test Product",
          brand: "DB",
          type: "Test",
          ean: "9876543210123",
          vertical: "TEST",
          required_by_date: null,
          supplier_mrp: "12.0",
          supplier_price: "10.0",
          taxable_value: "10.0",
          igst_rate: "18.0",
          igst_amount_per_unit: "1.8",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "1.8",
          total_amount: "11.8",
          status: "Pending",
          created_by: "db-test"
        }
      ]
    };

    const importResponse = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importData)
    });

    const importResult = await importResponse.json();
    console.log(`Import Status: ${importResponse.status}`);
    console.log(`Import Result ID: ${importResult.id}`);
    console.log(`Import Result PO: ${importResult.po_number}`);

    // Test 3: Immediate check by specific ID
    if (importResult.id) {
      console.log(`\\n🔍 STEP 3: Check by ID ${importResult.id}`);
      console.log('-'.repeat(40));

      try {
        const byIdResponse = await fetch(`http://localhost:5000/api/flipkart-grocery-pos/${importResult.id}`);
        console.log(`By ID Status: ${byIdResponse.status}`);

        if (byIdResponse.ok) {
          const byIdResult = await byIdResponse.json();
          console.log(`✅ Found by ID: ${byIdResult.po_number}`);
          console.log(`   Lines: ${byIdResult.poLines ? byIdResult.poLines.length : 'No lines'}`);
        } else {
          const errorText = await byIdResponse.text();
          console.log(`❌ Not found by ID: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Error checking by ID: ${error.message}`);
      }
    }

    // Test 4: Check all POs again
    console.log(`\\n📊 STEP 4: Check All POs`);
    console.log('-'.repeat(40));

    const finalCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const finalPos = await finalCheck.json();
    console.log(`Final POs: ${finalPos.length}`);

    const foundPo = finalPos.find(po => po.po_number === testPo);
    if (foundPo) {
      console.log(`✅ Found in list: ${foundPo.po_number} (ID: ${foundPo.id})`);
    } else {
      console.log(`❌ NOT found in list`);
    }

    // Test 5: Test different query methods
    console.log(`\\n🔎 STEP 5: Alternative Database Queries`);
    console.log('-'.repeat(40));

    // Try direct database query via a custom endpoint if available
    try {
      const directQuery = await fetch(`http://localhost:5000/api/flipkart-grocery-pos?po_number=${testPo}`);
      if (directQuery.ok) {
        const directResult = await directQuery.json();
        console.log(`Direct query result: ${directResult.length || 'No results'}`);
      }
    } catch (error) {
      console.log(`Direct query not available: ${error.message}`);
    }

    // Test 6: Check connection details
    console.log(`\\n🔌 STEP 6: Connection Analysis`);
    console.log('-'.repeat(40));

    console.log('Possible Issues:');
    console.log('1. Multiple DB connections (different databases)');
    console.log('2. Transaction isolation level problems');
    console.log('3. Commit timing issues');
    console.log('4. Connection pooling problems');
    console.log('5. Database trigger or constraint rollbacks');

    // Test 7: Wait and check again
    console.log(`\\n⏳ STEP 7: Wait and Re-check (10 seconds)`);
    console.log('-'.repeat(40));

    await new Promise(resolve => setTimeout(resolve, 10000));

    const delayedCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const delayedPos = await delayedCheck.json();
    console.log(`After delay POs: ${delayedPos.length}`);

    const delayedPo = delayedPos.find(po => po.po_number === testPo);
    if (delayedPo) {
      console.log(`✅ Found after delay: ${delayedPo.po_number}`);
    } else {
      console.log(`❌ Still not found after delay`);
    }

    console.log(`\\n📋 SUMMARY:`);
    console.log(`Import API: ${importResponse.status === 201 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`By ID Check: ${foundPo ? 'SUCCESS' : 'FAILED'}`);
    console.log(`List Check: ${foundPo ? 'SUCCESS' : 'FAILED'}`);
    console.log(`After Delay: ${delayedPo ? 'SUCCESS' : 'FAILED'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting database connection test...');
testDbConnection().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});