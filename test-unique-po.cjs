const axios = require('axios');

async function testUniquePoNumber() {
  try {
    console.log('🧪 Testing with unique PO number...');

    const uniquePoData = {
      header: {
        po_number: `TEST_${Date.now()}`, // Generate unique PO number
        po_date: new Date().toISOString(),
        vendor_name: 'Test Vendor',
        grand_total: 100,
        total_items: 1,
        total_quantity: 1,
        status: 'pending',
        created_by: 'test'
      },
      lines: [
        {
          line_number: 1,
          item_code: 'TEST001',
          item_description: 'Test Item',
          quantity: 1,
          unit_base_cost: 100,
          line_total: 100
        }
      ]
    };

    console.log('📤 Testing with PO number:', uniquePoData.header.po_number);

    const response = await axios.post('http://127.0.0.1:5001/api/swiggy-pos', uniquePoData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success with unique PO!');
    console.log('📥 Response:', response.data);

  } catch (error) {
    console.error('❌ Still failed:', {
      status: error.response ? error.response.status : 'No status',
      data: error.response ? error.response.data : 'No response data'
    });
  }
}

testUniquePoNumber();