async function testDirectDb() {
  console.log('🔗 TESTING DIRECT DATABASE CONNECTION');
  console.log('='.repeat(50));

  try {
    // Test simple API call first
    console.log('1️⃣  Testing simple API health check...');

    try {
      const healthResponse = await fetch('http://localhost:5000/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ API Health:', healthData);
      } else {
        console.log('❌ API Health check failed:', healthResponse.status);
      }
    } catch (healthError) {
      console.log('❌ API Health error:', healthError.message);
    }

    // Test database endpoint
    console.log('\\n2️⃣  Testing database-dependent endpoints...');

    try {
      const dbResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
      console.log(`Database endpoint status: ${dbResponse.status}`);

      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        console.log(`Database returned: ${dbData.length} records`);
      } else {
        const errorText = await dbResponse.text();
        console.log(`Database error: ${errorText}`);
      }
    } catch (dbError) {
      console.log('❌ Database endpoint error:', dbError.message);
    }

    // Test with minimal valid import
    console.log('\\n3️⃣  Testing minimal import...');

    const minimalData = {
      header: {
        po_number: `DIRECT_${Date.now()}`,
        supplier_name: "Direct Test",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "direct-test",
        uploaded_by: "direct-test",
        // Required empty fields
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
      lines: []
    };

    console.log(`Testing PO: ${minimalData.header.po_number}`);

    const startTime = Date.now();
    const importResponse = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalData)
    });
    const importTime = Date.now() - startTime;

    console.log(`Import took: ${importTime}ms`);
    console.log(`Import status: ${importResponse.status}`);

    let importResult;
    try {
      const responseText = await importResponse.text();
      importResult = JSON.parse(responseText);
      console.log(`Import result ID: ${importResult.id}`);
      console.log(`Import result PO: ${importResult.po_number}`);
    } catch (parseError) {
      console.log('❌ Could not parse import response:', parseError.message);
      return;
    }

    // Test immediate retrieval
    console.log('\\n4️⃣  Testing immediate retrieval...');

    if (importResult.id) {
      // Wait a brief moment for any network/commit delays
      await new Promise(resolve => setTimeout(resolve, 500));

      const retrievalResponse = await fetch(`http://localhost:5000/api/flipkart-grocery-pos/${importResult.id}`);
      console.log(`Retrieval status: ${retrievalResponse.status}`);

      if (retrievalResponse.ok) {
        const retrieved = await retrievalResponse.json();
        console.log(`✅ Successfully retrieved: ${retrieved.po_number}`);
      } else {
        const errorText = await retrievalResponse.text();
        console.log(`❌ Retrieval failed: ${errorText}`);
      }
    }

    // Test list retrieval
    console.log('\\n5️⃣  Testing list retrieval...');

    const listResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    if (listResponse.ok) {
      const allPos = await listResponse.json();
      console.log(`Total POs in list: ${allPos.length}`);

      const foundInList = allPos.find(po => po.po_number === minimalData.header.po_number);
      if (foundInList) {
        console.log(`✅ Found in list: ${foundInList.po_number}`);
      } else {
        console.log(`❌ Not found in list`);
      }
    }

    // Final analysis
    console.log('\\n📊 ANALYSIS:');
    console.log('-'.repeat(30));

    if (importResponse.status === 201 && importResult.id) {
      console.log('✅ Import API working correctly');
      console.log('❌ Data persistence failing');
      console.log('🔍 Likely causes:');
      console.log('   • Remote database connection issues');
      console.log('   • Transaction commit timing problems');
      console.log('   • Network latency with remote DB');
      console.log('   • Connection pool exhaustion');
      console.log('   • Database constraint violations');
    } else {
      console.log('❌ Import API failing');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting direct database test...');
testDirectDb().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});