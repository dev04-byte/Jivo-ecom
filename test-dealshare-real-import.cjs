const axios = require('axios');

async function testRealDealShareImport() {
  try {
    console.log('🔍 Testing real DealShare Import with actual UI data structure...');

    // This simulates the actual data structure that comes from the frontend
    // when a user clicks "Import Data into Database"
    const realTestData = {
      header: {
        po_number: 'TEST_1187393',
        po_created_date: '2025-09-23T18:30:00.000Z', // Date as ISO string (what frontend sends)
        po_delivery_date: '2025-09-23T18:30:00.000Z',
        po_expiry_date: '2025-09-30T18:30:00.000Z',
        shipped_by: 'Real Test Vendor',
        shipped_by_address: 'Real Test Address',
        shipped_by_gstin: '07AAFCJ4102J1ZS',
        shipped_by_phone: '9717471260',
        vendor_code: '5484',
        shipped_to: 'VKI(HUB)',
        shipped_to_address: 'Real Shipped To Address',
        shipped_to_gstin: '08AAMCM0523D1ZS',
        bill_to: 'Real Bill To Company',
        bill_to_address: 'Real Bill To Address',
        bill_to_gstin: '08AAMCM0523D1ZS',
        comments: 'Real Import Test',
        total_items: 2,
        total_quantity: '36',
        total_gross_amount: '12400.00',
        uploaded_by: 'real_test_user'
      },
      lines: [
        {
          line_number: 1,
          sku: 'REAL_SKU_001',
          product_name: 'Real Test Product 1',
          hsn_code: '15141920',
          quantity: 20,
          mrp_tax_inclusive: '375.00',
          buying_price: '210.00',
          gst_percent: '5.00',
          cess_percent: '0.00',
          gross_amount: '4200.00'
        },
        {
          line_number: 2,
          sku: 'REAL_SKU_002',
          product_name: 'Real Test Product 2',
          hsn_code: '15099090',
          quantity: 16,
          mrp_tax_inclusive: '1499.00',
          buying_price: '525.00',
          gst_percent: '5.00',
          cess_percent: '0.00',
          gross_amount: '8200.00'
        }
      ]
    };

    console.log('📤 Sending real import request...');
    console.log('Header dates:', {
      po_created_date: realTestData.header.po_created_date,
      po_delivery_date: realTestData.header.po_delivery_date,
      po_expiry_date: realTestData.header.po_expiry_date,
      types: {
        po_created_date: typeof realTestData.header.po_created_date,
        po_delivery_date: typeof realTestData.header.po_delivery_date,
        po_expiry_date: typeof realTestData.header.po_expiry_date
      }
    });

    // Make API call to import endpoint
    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', realTestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    console.log('\n✅ Real import successful!');
    console.log('Status:', response.status);
    console.log('Response:', {
      message: response.data.message,
      success: response.data.success,
      po_id: response.data.data?.id,
      po_number: response.data.data?.po_number
    });

    console.log('\n🎯 Real import completed successfully!');

  } catch (error) {
    console.error('\n❌ Real import test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRealDealShareImport();