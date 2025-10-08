// Test City Mall import with sample data matching actual schema
const testCityMallData = {
  header: {
    po_number: `TEST-CM-${Date.now()}`,
    po_date: new Date().toISOString(),
    po_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    vendor_name: "Jivo Mart Private Limited",
    vendor_gstin: "07AAFCJ4102J1ZS",
    vendor_code: "VENDOR001",
    status: "Open",
    total_quantity: 100,
    total_base_amount: "41000.00",
    total_igst_amount: "7380.00",
    total_cess_amount: "0.00",
    total_amount: "48380.00",
    unique_hsn_codes: ["15099090"],
    created_by: "test_user",
    uploaded_by: "test_user"
  },
  lines: [
    {
      line_number: 1,
      article_id: "ITEM001",
      article_name: "Jivo Extra Virgin Olive Oil 500ml",
      hsn_code: "15099090",
      mrp: "549.00",
      base_cost_price: "400.00",
      quantity: 50,
      base_amount: "20000.00",
      igst_percent: "18.00",
      cess_percent: "0.00",
      igst_amount: "3600.00",
      cess_amount: "0.00",
      total_amount: "23600.00",
      status: "Pending",
      created_by: "test_user"
    },
    {
      line_number: 2,
      article_id: "ITEM002",
      article_name: "Jivo Pomace Olive Oil 1L",
      hsn_code: "15099090",
      mrp: "799.00",
      base_cost_price: "420.00",
      quantity: 50,
      base_amount: "21000.00",
      igst_percent: "18.00",
      cess_percent: "0.00",
      igst_amount: "3780.00",
      cess_amount: "0.00",
      total_amount: "24780.00",
      status: "Pending",
      created_by: "test_user"
    }
  ]
};

async function testImport() {
  try {
    console.log('🚀 Testing City Mall Import...');
    console.log('📦 PO Number:', testCityMallData.header.po_number);
    console.log('📦 Vendor:', testCityMallData.header.vendor_name);
    console.log('📦 Items:', testCityMallData.lines.length);

    const response = await fetch('http://localhost:5000/api/po/import/citymall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCityMallData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! PO imported successfully');
      console.log('📄 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ ERROR! Import failed');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ EXCEPTION:', error.message);
  }
}

testImport();
