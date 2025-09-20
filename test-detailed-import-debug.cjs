async function detailedImportDebug() {
  console.log('🔬 DETAILED IMPORT DEBUGGING');
  console.log('='.repeat(60));

  try {
    // First, check if the PO already exists
    console.log('🔍 STEP 1: Check for existing PO');
    console.log('-'.repeat(40));

    const testPoNumber = `DEBUG_PO_${Date.now()}`;
    console.log(`Using unique PO number: ${testPoNumber}`);

    // Check if this PO exists
    const existingCheck = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const existingPos = await existingCheck.json();
    const existingPo = existingPos.find(po => po.po_number === testPoNumber);
    console.log(`Existing PO with this number: ${existingPo ? 'YES' : 'NO'}`);

    // Prepare minimal valid data that should work
    const minimalTestData = {
      header: {
        // Required fields only
        po_number: testPoNumber,
        supplier_name: "Debug Test Supplier",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "debug-test",
        uploaded_by: "debug-test",
        // Optional fields with defaults
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
        total_quantity: 0,
        total_taxable_value: "0",
        total_tax_amount: "0",
        total_amount: "0"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "12345678",
          fsn_isbn: "DEBUG_FSN",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "Debug Test Product",
          brand: "Debug",
          type: "Test",
          ean: "1234567890123",
          vertical: "TEST",
          required_by_date: null,
          supplier_mrp: "10.0",
          supplier_price: "8.0",
          taxable_value: "8.0",
          igst_rate: "0.0",
          igst_amount_per_unit: "0.0",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "0.0",
          total_amount: "8.0",
          status: "Pending",
          created_by: "debug-test"
        }
      ]
    };

    console.log('✅ Test data prepared');
    console.log(`  Header fields: ${Object.keys(minimalTestData.header).length}`);
    console.log(`  Line items: ${minimalTestData.lines.length}`);

    // Make the import API call with detailed monitoring
    console.log('\\n📡 STEP 2: Make Import API Call');
    console.log('-'.repeat(40));

    const startTime = Date.now();

    let response;
    let responseText;
    let responseData;

    try {
      console.log('Sending POST request to /api/po/import/flipkart...');

      response = await fetch('http://localhost:5000/api/po/import/flipkart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalTestData)
      });

      responseText = await response.text();
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log(`Response time: ${Date.now() - startTime}ms`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      try {
        responseData = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.log('Raw response text:', responseText);
        console.log('JSON parse error:', parseError.message);
      }

    } catch (fetchError) {
      console.error('Fetch error:', fetchError.message);
      return;
    }

    // Check database immediately after
    console.log('\\n🔍 STEP 3: Immediate Database Check');
    console.log('-'.repeat(40));

    try {
      const dbCheckResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
      const allPos = await dbCheckResponse.json();

      console.log(`Total POs in database: ${allPos.length}`);

      const foundPo = allPos.find(po => po.po_number === testPoNumber);
      if (foundPo) {
        console.log('✅ PO found in database!');
        console.log(`  Database ID: ${foundPo.id}`);
        console.log(`  PO Number: ${foundPo.po_number}`);
        console.log(`  Supplier: ${foundPo.supplier_name}`);
        console.log(`  Created: ${foundPo.created_at}`);
        console.log(`  Lines: ${foundPo.poLines ? foundPo.poLines.length : 'No lines'}`);
      } else {
        console.log('❌ PO NOT found in database');
        if (allPos.length > 0) {
          console.log('Available POs:');
          allPos.slice(0, 3).forEach(po => {
            console.log(`  - ${po.po_number} (ID: ${po.id})`);
          });
        }
      }
    } catch (dbError) {
      console.error('Database check error:', dbError.message);
    }

    // Analyze the results
    console.log('\\n📊 STEP 4: Analysis');
    console.log('-'.repeat(40));

    const isSuccessStatus = response && (response.status === 200 || response.status === 201);
    const hasReturnedId = responseData && responseData.id;
    const foundInDatabase = responseData && responseData.id;

    console.log(`API Success Status: ${isSuccessStatus ? '✅' : '❌'} (${response?.status})`);
    console.log(`Returned ID: ${hasReturnedId ? '✅' : '❌'} (${responseData?.id || 'None'})`);
    console.log(`Found in Database: ${foundInDatabase ? '✅' : '❌'}`);

    if (isSuccessStatus && hasReturnedId && !foundInDatabase) {
      console.log('\\n🚨 PROBLEM IDENTIFIED:');
      console.log('   • API returns success and ID');
      console.log('   • But data is not persisted in database');
      console.log('   • Likely causes:');
      console.log('     1. Transaction rollback due to constraint violation');
      console.log('     2. Error in storage.createFlipkartGroceryPo() that is caught');
      console.log('     3. Database connection issue');
      console.log('     4. Schema mismatch causing silent failure');
    }

    // Test with deliberately invalid data
    console.log('\\n🧪 STEP 5: Test with Invalid Data');
    console.log('-'.repeat(40));

    const invalidTestData = {
      header: {
        po_number: null, // This should cause validation error
        supplier_name: "Test"
      },
      lines: []
    };

    try {
      const invalidResponse = await fetch('http://localhost:5000/api/po/import/flipkart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidTestData)
      });

      const invalidResult = await invalidResponse.text();
      console.log(`Invalid data response: ${invalidResponse.status} ${invalidResponse.statusText}`);
      console.log(`Invalid data message: ${invalidResult}`);

    } catch (error) {
      console.log('Invalid data test error:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

console.log('Starting detailed import debugging...');
detailedImportDebug().then(() => {
  console.log('\\n✅ Debug test completed');
}).catch(error => {
  console.error('❌ Debug test error:', error);
});