async function testBasicDb() {
  console.log('🧪 TESTING BASIC DATABASE FUNCTIONALITY');
  console.log('='.repeat(50));

  try {
    // Test 1: Check if database tables exist
    console.log('1️⃣  Checking if database tables exist...');

    // Try to create a simple test PO using the regular API endpoints
    console.log('\\n2️⃣  Testing with Flipkart-specific endpoint...');

    const testData = {
      header: {
        po_number: `BASIC_TEST_${Date.now()}`,
        supplier_name: "Basic Test Supplier",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "basic-test",
        uploaded_by: "basic-test",
        supplier_address: "Test Address",
        supplier_contact: "1234567890",
        supplier_email: "test@test.com",
        supplier_gstin: "TEST123456789",
        billed_to_address: "Test Billing",
        billed_to_gstin: "BILL123456789",
        shipped_to_address: "Test Shipping",
        shipped_to_gstin: "SHIP123456789",
        nature_of_supply: "Inter-State",
        nature_of_transaction: "Sale",
        po_expiry_date: null,
        category: "GROCERY",
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
        total_quantity: 1,
        total_taxable_value: "100.00",
        total_tax_amount: "18.00",
        total_amount: "118.00"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "12345678",
          fsn_isbn: "BASIC_TEST_FSN",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "Basic Test Product",
          brand: "Basic",
          type: "Test",
          ean: "1234567890123",
          vertical: "GROCERY",
          required_by_date: null,
          supplier_mrp: "120.00",
          supplier_price: "100.00",
          taxable_value: "100.00",
          igst_rate: "18.0",
          igst_amount_per_unit: "18.0",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "18.0",
          total_amount: "118.0",
          status: "Pending",
          created_by: "basic-test"
        }
      ]
    };

    console.log(`Testing PO: ${testData.header.po_number}`);

    // Try the Flipkart-specific endpoint instead of import
    console.log('\\n3️⃣  Using POST /api/flipkart-grocery-pos endpoint...');

    const flipkartResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log(`Flipkart endpoint status: ${flipkartResponse.status}`);

    let flipkartResult;
    try {
      const responseText = await flipkartResponse.text();
      console.log('Raw response:', responseText.substring(0, 200) + '...');

      if (flipkartResponse.ok) {
        flipkartResult = JSON.parse(responseText);
        console.log(`✅ Flipkart endpoint success: ID ${flipkartResult.id}`);
      } else {
        console.log(`❌ Flipkart endpoint failed: ${responseText}`);
      }
    } catch (parseError) {
      console.log(`❌ Could not parse response: ${parseError.message}`);
    }

    // Test immediate retrieval
    if (flipkartResult && flipkartResult.id) {
      console.log('\\n4️⃣  Testing immediate retrieval...');

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      const getResponse = await fetch(`http://localhost:5000/api/flipkart-grocery-pos/${flipkartResult.id}`);
      console.log(`Get by ID status: ${getResponse.status}`);

      if (getResponse.ok) {
        const retrievedPo = await getResponse.json();
        console.log(`✅ Successfully retrieved: ${retrievedPo.po_number}`);
        console.log(`   Lines: ${retrievedPo.lines ? retrievedPo.lines.length : 'No lines'}`);
      } else {
        const errorText = await getResponse.text();
        console.log(`❌ Retrieval failed: ${errorText}`);
      }
    }

    // Check list
    console.log('\\n5️⃣  Checking full list...');
    const listResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    if (listResponse.ok) {
      const allPos = await listResponse.json();
      console.log(`Total POs in list: ${allPos.length}`);

      if (allPos.length > 0) {
        console.log('Recent POs:');
        allPos.slice(0, 3).forEach(po => {
          console.log(`  - ${po.po_number} (ID: ${po.id}) - ${po.supplier_name}`);
        });
      }

      if (flipkartResult) {
        const foundPo = allPos.find(po => po.po_number === testData.header.po_number);
        if (foundPo) {
          console.log(`✅ Found in list: ${foundPo.po_number}`);
        } else {
          console.log(`❌ Not found in list`);
        }
      }
    }

    console.log('\\n📊 CONCLUSION:');
    console.log('-'.repeat(30));

    if (flipkartResponse.ok && flipkartResult) {
      console.log('✅ Direct Flipkart endpoint works');
    } else {
      console.log('❌ Direct Flipkart endpoint fails');
    }

    console.log('\\n💡 RECOMMENDATION:');
    console.log('If the direct endpoint works but import does not,');
    console.log('the issue is specifically in the import route processing.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting basic database test...');
testBasicDb().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});