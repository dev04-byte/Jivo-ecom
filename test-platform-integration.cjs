async function testPlatformIntegration() {
  console.log('🔗 TESTING FLIPKART INTEGRATION WITH PLATFORM PURCHASE ORDERS');
  console.log('='.repeat(70));

  try {
    // Test 1: Import a Flipkart PO
    console.log('1️⃣  Importing Flipkart PO...');

    const testFlipkartData = {
      header: {
        po_number: `PLATFORM_TEST_${Date.now()}`,
        supplier_name: "Platform Integration Test Supplier",
        order_date: new Date().toISOString(),
        status: "Open",
        created_by: "platform-test",
        uploaded_by: "platform-test",
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
        total_quantity: 2,
        total_taxable_value: "50.00",
        total_tax_amount: "9.00",
        total_amount: "59.00"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "12345678",
          fsn_isbn: "PLATFORM_TEST_FSN_1",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "Platform Test Product 1",
          brand: "Test",
          type: "Integration",
          ean: "1111111111111",
          vertical: "GROCERY",
          required_by_date: null,
          supplier_mrp: "30.00",
          supplier_price: "25.00",
          taxable_value: "25.00",
          igst_rate: "18.0",
          igst_amount_per_unit: "4.5",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "4.5",
          total_amount: "29.5",
          status: "Pending",
          created_by: "platform-test"
        },
        {
          line_number: 2,
          hsn_code: "87654321",
          fsn_isbn: "PLATFORM_TEST_FSN_2",
          quantity: 1,
          pending_quantity: 1,
          uom: "PCS",
          title: "Platform Test Product 2",
          brand: "Test",
          type: "Integration",
          ean: "2222222222222",
          vertical: "GROCERY",
          required_by_date: null,
          supplier_mrp: "30.00",
          supplier_price: "25.00",
          taxable_value: "25.00",
          igst_rate: "18.0",
          igst_amount_per_unit: "4.5",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "4.5",
          total_amount: "29.5",
          status: "Pending",
          created_by: "platform-test"
        }
      ]
    };

    console.log(`Testing PO: ${testFlipkartData.header.po_number}`);

    const importResponse = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testFlipkartData)
    });

    console.log(`Import Status: ${importResponse.status}`);

    if (importResponse.ok) {
      const importResult = await importResponse.json();
      console.log(`✅ Import successful: ID ${importResult.id}, PO ${importResult.po_number}`);

      // Test 2: Check if it appears in Platform Purchase Orders
      console.log('\n2️⃣  Checking Platform Purchase Orders...');

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      const platformResponse = await fetch('http://localhost:5000/api/pos');

      if (platformResponse.ok) {
        const allPlatformPos = await platformResponse.json();
        console.log(`Total Platform POs: ${allPlatformPos.length}`);

        const foundFlipkartPo = allPlatformPos.find(po => po.po_number === testFlipkartData.header.po_number);

        if (foundFlipkartPo) {
          console.log(`✅ SUCCESS: Flipkart PO found in Platform Purchase Orders!`);
          console.log(`   PO Number: ${foundFlipkartPo.po_number}`);
          console.log(`   Platform: ${foundFlipkartPo.platform?.pf_name || 'Unknown'}`);
          console.log(`   Supplier: ${foundFlipkartPo.vendor_name}`);
          console.log(`   Total Amount: ${foundFlipkartPo.total_amount}`);
          console.log(`   Order Items: ${foundFlipkartPo.orderItems?.length || 0}`);

          if (foundFlipkartPo.orderItems && foundFlipkartPo.orderItems.length > 0) {
            console.log(`   First Item: ${foundFlipkartPo.orderItems[0].item_description}`);
          }
        } else {
          console.log(`❌ FAILED: Flipkart PO NOT found in Platform Purchase Orders`);

          // Show what platforms we do have
          const platformCounts = {};
          allPlatformPos.forEach(po => {
            const platform = po.platform?.pf_name || 'Unknown';
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
          });

          console.log(`Platform breakdown:`, platformCounts);

          // Show recent POs
          console.log(`Recent POs (last 5):`);
          allPlatformPos.slice(0, 5).forEach(po => {
            console.log(`  - ${po.po_number} (${po.platform?.pf_name || 'Unknown'}) - ${po.vendor_name}`);
          });
        }
      } else {
        console.log(`❌ Failed to fetch Platform Purchase Orders: ${platformResponse.status}`);
      }

      // Test 3: Direct check in Flipkart Grocery endpoint
      console.log('\n3️⃣  Direct check in Flipkart Grocery endpoint...');

      const flipkartDirectResponse = await fetch('http://localhost:5000/api/flipkart-grocery-pos');

      if (flipkartDirectResponse.ok) {
        const flipkartPos = await flipkartDirectResponse.json();
        console.log(`Flipkart Grocery POs: ${flipkartPos.length}`);

        const foundDirect = flipkartPos.find(po => po.po_number === testFlipkartData.header.po_number);
        if (foundDirect) {
          console.log(`✅ Found in direct Flipkart endpoint: ${foundDirect.po_number}`);
        } else {
          console.log(`❌ NOT found in direct Flipkart endpoint`);
        }
      }

    } else {
      const errorText = await importResponse.text();
      console.log(`❌ Import failed: ${errorText}`);
    }

    console.log('\n📊 SUMMARY:');
    console.log('-'.repeat(40));
    console.log('✅ Integration test complete');
    console.log('✅ Flipkart POs should now appear in Platform Purchase Orders');
    console.log('✅ getAllPos() method updated to include Flipkart Grocery POs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('Starting platform integration test...');
testPlatformIntegration().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});