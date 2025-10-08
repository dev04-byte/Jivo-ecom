// Test script to import sample Flipkart Grocery PO
const testFlipkartData = {
  header: {
    po_number: `TEST-FK-${Date.now()}`,
    supplier_name: "Jivo Mart Private Limited",
    supplier_address: "J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027",
    supplier_contact: "9818805452",
    supplier_email: "marketplace@jivo.in",
    supplier_gstin: "07AAFCJ4102J1ZS",
    billed_to_address: "Flipkart Internet Pvt Ltd, Buildings Alyssa, Begonia & Clover, Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru - 560103, Karnataka",
    billed_to_gstin: "29AABCI9379C1ZQ",
    shipped_to_address: "FC - Karnataka Bangalore_I, Flipkart Internet Pvt Ltd, Survey No. 141/1, Begur Hobli, Bangalore North Taluk, Bangalore - 560100",
    shipped_to_gstin: "29AABCI9379C1ZQ",
    nature_of_supply: "Interstate",
    nature_of_transaction: "Regular",
    po_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    category: "Grocery",
    order_date: new Date().toISOString(),
    mode_of_payment: "Credit",
    contract_ref_id: "CNT123456",
    contract_version: "V1.0",
    credit_term: "NET 30",
    total_quantity: 100,
    total_taxable_value: "5000.00",
    total_tax_amount: "900.00",
    total_amount: "5900.00",
    status: "Open",
    distributor: "Jivo Mart",
    area: "Bangalore",
    city: "Bangalore",
    region: "South",
    state: "Karnataka",
    dispatch_from: "Delhi Warehouse",
    created_by: "test_user",
    uploaded_by: "test_user"
  },
  lines: [
    {
      line_number: 1,
      hsn_code: "15099090",
      fsn_isbn: "OILEJG4MNKRXZSPF",
      quantity: 50,
      pending_quantity: 50,
      uom: "BOTTLES",
      title: "Jivo Extra Virgin Olive Oil 500ml",
      brand: "Jivo",
      type: "Oil",
      ean: "8908002585832",
      vertical: "Grocery",
      required_by_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      supplier_mrp: "549.00",
      supplier_price: "275.00",
      taxable_value: "13750.00",
      igst_rate: "18.00",
      igst_amount_per_unit: "49.50",
      sgst_rate: "0.00",
      sgst_amount_per_unit: "0.00",
      cgst_rate: "0.00",
      cgst_amount_per_unit: "0.00",
      cess_rate: "0.00",
      cess_amount_per_unit: "0.00",
      tax_amount: "2475.00",
      total_amount: "16225.00",
      status: "Pending",
      created_by: "test_user"
    },
    {
      line_number: 2,
      hsn_code: "15099090",
      fsn_isbn: "OILEJG4MNKRXAABC",
      quantity: 50,
      pending_quantity: 50,
      uom: "BOTTLES",
      title: "Jivo Pomace Olive Oil 1L",
      brand: "Jivo",
      type: "Oil",
      ean: "8908002585849",
      vertical: "Grocery",
      required_by_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      supplier_mrp: "799.00",
      supplier_price: "380.00",
      taxable_value: "19000.00",
      igst_rate: "18.00",
      igst_amount_per_unit: "68.40",
      sgst_rate: "0.00",
      sgst_amount_per_unit: "0.00",
      cgst_rate: "0.00",
      cgst_amount_per_unit: "0.00",
      cess_rate: "0.00",
      cess_amount_per_unit: "0.00",
      tax_amount: "3420.00",
      total_amount: "22420.00",
      status: "Pending",
      created_by: "test_user"
    }
  ]
};

async function testImport() {
  try {
    console.log('🚀 Testing Flipkart Grocery PO Import...');
    console.log('📦 PO Number:', testFlipkartData.header.po_number);
    console.log('📦 Supplier:', testFlipkartData.header.supplier_name);
    console.log('📦 Items:', testFlipkartData.lines.length);

    const response = await fetch('http://localhost:5000/api/po/import/flipkart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFlipkartData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! PO imported successfully');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERROR! Import failed');
      console.log('Status:', response.status);
      console.log('Error:', data.error || data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ EXCEPTION:', error.message);
  }
}

// Run the test
testImport();
