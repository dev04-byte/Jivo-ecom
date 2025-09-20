async function testSimpleImport() {
  console.log('🧪 SIMPLE IMPORT TEST WITH MINIMAL DATA');
  console.log('='.repeat(50));

  try {
    // Create the absolute minimum valid data
    const minData = {
      header: {
        po_number: `MIN_${Date.now()}`,
        supplier_name: "Min Test",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "min-test",
        uploaded_by: "min-test",
        // All the required empty fields
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
        total_taxable_value: "100.0",
        total_tax_amount: "18.0",
        total_amount: "118.0"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "12345678",
          fsn_isbn: "MIN_FSN",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "Min Test Product",
          brand: "Min",
          type: "Test",
          ean: "1234567890123",
          vertical: "TEST",
          required_by_date: null,
          supplier_mrp: "120.0",
          supplier_price: "100.0",
          taxable_value: "100.0",
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
          created_by: "min-test"
        }
      ]
    };

    console.log(`📋 Testing PO: ${minData.header.po_number}`);

    // Make the API call
    console.log('🚀 Making API call...');
    const response = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minData)
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);
      console.log('📄 Response:', JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      return;
    }

    // Wait a moment then check database
    console.log('\\n⏳ Waiting 2 seconds before database check...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Checking database...');
    const dbResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');
    const allPos = await dbResponse.json();

    console.log(`📊 Total POs in database: ${allPos.length}`);

    const foundPo = allPos.find(po => po.po_number === minData.header.po_number);
    if (foundPo) {
      console.log('✅ SUCCESS: PO found in database!');
      console.log(`  ID: ${foundPo.id}`);
      console.log(`  PO Number: ${foundPo.po_number}`);
      console.log(`  Lines: ${foundPo.poLines ? foundPo.poLines.length : 'No lines'}`);
    } else {
      console.log('❌ FAILURE: PO not found in database');

      if (responseData && responseData.id) {
        console.log('\\n🔍 PROBLEM ANALYSIS:');
        console.log('   • API returned success with ID');
        console.log('   • But data not persisted to database');
        console.log('   • This indicates transaction rollback');
        console.log('   • Check server logs for error details');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting simple import test...');
testSimpleImport().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});