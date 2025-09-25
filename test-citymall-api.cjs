// Test CityMall import API
const fetch = require('node-fetch').default || require('node-fetch');

async function testCityMallImport() {
  try {
    console.log('🧪 Testing CityMall import API...');

    // Create test data that matches the parser output
    const testData = {
      header: {
        po_number: 'TEST-CM-' + Date.now(),
        po_date: new Date().toISOString(),
        vendor_name: 'Test Vendor',
        vendor_gstin: 'TEST123456789',
        status: 'Open',
        total_quantity: 2,
        total_amount: 500.00,
        created_by: 'test-user'
      },
      lines: [
        {
          line_number: 1,
          article_id: 'ART001',
          article_name: 'Test Article 1',
          hsn_code: '12345678',
          quantity: 1,
          mrp: 100.00,
          base_cost_price: 80.00,
          base_amount: 80.00,
          igst_percent: 18.00,
          igst_amount: 14.40,
          total_amount: 94.40
        },
        {
          line_number: 2,
          article_id: 'ART002',
          article_name: 'Test Article 2',
          hsn_code: '87654321',
          quantity: 3,
          mrp: 150.00,
          base_cost_price: 120.00,
          base_amount: 360.00,
          igst_percent: 18.00,
          igst_amount: 64.80,
          cess_percent: 5.00,
          cess_amount: 18.00,
          total_amount: 442.80
        }
      ]
    };

    console.log('📤 Sending import request to CityMall API...');

    const response = await fetch('http://127.0.0.1:5001/api/po/import/citymall', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    const result = await response.json();
    console.log('📋 Response data:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Import successful!');

      // Verify by fetching all CityMall POs
      console.log('🔍 Fetching all CityMall POs...');
      const posResponse = await fetch('http://127.0.0.1:5001/api/city-mall-pos');
      const pos = await posResponse.json();

      console.log(`📊 Found ${pos.length} CityMall POs in database`);

      if (pos.length > 0) {
        const latestPo = pos[0];
        console.log('📋 Latest PO:', {
          id: latestPo.id,
          po_number: latestPo.po_number,
          vendor_name: latestPo.vendor_name,
          total_amount: latestPo.total_amount,
          lines_count: latestPo.poLines?.length || 0
        });
      }

      // Also check unified POs list
      console.log('🔍 Checking unified POs list...');
      const unifiedResponse = await fetch('http://127.0.0.1:5001/api/pos');
      const unifiedPos = await unifiedResponse.json();

      const cityMallPos = unifiedPos.filter(po => po.platform?.pf_name === 'CityMall');
      console.log(`📊 Found ${cityMallPos.length} CityMall POs in unified list`);

      if (cityMallPos.length > 0) {
        console.log('📋 CityMall PO in unified list:', {
          id: cityMallPos[0].id,
          po_number: cityMallPos[0].po_number,
          platform: cityMallPos[0].platform?.pf_name,
          total_amount: cityMallPos[0].total_amount
        });
      }

    } else {
      console.log('❌ Import failed:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCityMallImport();