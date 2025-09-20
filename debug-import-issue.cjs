async function testImportAPI() {
  console.log('🐛 DEBUGGING IMPORT API ISSUE');
  console.log('='.repeat(50));

  try {
    // Test data structure that should be sent to the API
    const testImportData = {
      header: {
        po_number: "FLFWG06905883",
        supplier_name: "Evara Enterprises(grocery_jivo_evara_ludh)",
        supplier_address: "PLOT NO 4006 KHUSROPUR DIST. LUDHIANA",
        supplier_contact: "0000000000",
        supplier_email: "procurement@evaraenterprises.in",
        supplier_gstin: "03AALFE9594L1ZR",
        billed_to_address: "FC BANGALORE",
        billed_to_gstin: "29AALFC0639B1ZN",
        shipped_to_address: "FC BANGALORE",
        shipped_to_gstin: "29AALFC0639B1ZN",
        nature_of_supply: "Inter-State",
        nature_of_transaction: "Sale",
        po_expiry_date: "2025-09-25T00:00:00.000Z",
        category: "GROCERY",
        order_date: "2025-09-18T00:00:00.000Z",
        mode_of_payment: "EFT",
        contract_ref_id: "VCO-0028924",
        contract_version: "2023-24",
        credit_term: "30 Days",
        distributor: "",
        area: "",
        city: "",
        region: "",
        state: "",
        dispatch_from: "",
        total_quantity: 1084,
        total_taxable_value: "201428.00",
        total_tax_amount: "36257.04",
        total_amount: "201428.00",
        status: "Open",
        created_by: "test-user",
        uploaded_by: "test-user"
      },
      lines: [
        {
          line_number: 1,
          hsn_code: "15149120",
          fsn_isbn: "MGGCOOKJ1LJIVO",
          quantity: 1020,
          pending_quantity: 1020,
          uom: "PCS",
          title: "JIVO Cold Pressed Pure Cooking (Pack of 1) Mustard Oil 1 L Plastic Bottle",
          brand: "JIVO",
          type: "PCS - Piece",
          ean: "8906041060124",
          vertical: "GROCERY",
          required_by_date: "2025-09-25T00:00:00.000Z",
          supplier_mrp: "250.0",
          supplier_price: "167.0",
          taxable_value: "170340.00",
          igst_rate: "18.0",
          igst_amount_per_unit: "30061.20",
          sgst_rate: "0.0",
          sgst_amount_per_unit: "0.0",
          cgst_rate: "0.0",
          cgst_amount_per_unit: "0.0",
          cess_rate: "0.0",
          cess_amount_per_unit: "0.0",
          tax_amount: "30061.20",
          total_amount: "170340.00",
          status: "Pending",
          created_by: "test-user"
        }
      ]
    };

    console.log('📋 Test Import Data Structure:');
    console.log(`  Header fields: ${Object.keys(testImportData.header).length}`);
    console.log(`  Line items: ${testImportData.lines.length}`);
    console.log(`  PO Number: ${testImportData.header.po_number}`);

    console.log('\\n🚀 Making API Call to Import Endpoint...');

    const response = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testImportData)
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    const responseData = await response.json();
    console.log('📄 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ API call succeeded');

      // Test if data was actually inserted by checking the database
      console.log('\\n🔍 Verifying Database Insertion...');

      const checkResponse = await fetch(`http://localhost:5000/api/flipkart-grocery-pos`);
      const allPos = await checkResponse.json();

      console.log(`📊 Total POs in database: ${allPos.length}`);

      const insertedPo = allPos.find(po => po.po_number === testImportData.header.po_number);

      if (insertedPo) {
        console.log('✅ PO found in database!');
        console.log(`📄 Database PO ID: ${insertedPo.id}`);
        console.log(`📄 Database PO Number: ${insertedPo.po_number}`);
        console.log(`📄 Database Supplier: ${insertedPo.supplier_name}`);
        console.log(`📦 Database Line Items: ${insertedPo.poLines ? insertedPo.poLines.length : 'Unknown'}`);
      } else {
        console.log('❌ PO NOT found in database!');
        console.log('🔍 Checking for any POs with similar numbers...');
        const similarPos = allPos.filter(po =>
          po.po_number && po.po_number.includes('FLFWG06905883')
        );
        if (similarPos.length > 0) {
          console.log(`📄 Similar POs found: ${similarPos.length}`);
          similarPos.forEach(po => {
            console.log(`  - ${po.po_number} (ID: ${po.id})`);
          });
        } else {
          console.log('📄 No similar POs found');
        }
      }

    } else {
      console.log('❌ API call failed');
      console.log('Error details:', responseData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

console.log('Starting import API test...');
testImportAPI().then(() => {
  console.log('\\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});