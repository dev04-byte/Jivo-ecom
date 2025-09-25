// Test viewing a specific CityMall PO by ID
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCityMallView() {
  try {
    console.log('🧪 Testing CityMall PO view by ID...');

    // First get the list of CityMall POs to find a valid ID
    console.log('📋 Getting list of CityMall POs...');
    const listResponse = await fetch('http://127.0.0.1:5001/api/city-mall-pos');

    if (!listResponse.ok) {
      throw new Error(`Failed to get CityMall POs: ${listResponse.status}`);
    }

    const cityMallPos = await listResponse.json();
    console.log(`📊 Found ${cityMallPos.length} CityMall POs`);

    if (cityMallPos.length === 0) {
      console.log('⚠️ No CityMall POs found to test');
      return;
    }

    // Get the latest CityMall PO
    const latestPo = cityMallPos[0];
    console.log(`📋 Testing PO: ${latestPo.po_number} (ID: ${latestPo.id})`);

    // Test the unified ID (original ID + 7000000)
    const unifiedId = 7000000 + latestPo.id;
    console.log(`🔍 Testing unified ID: ${unifiedId}`);

    // Get PO details using the unified view endpoint
    const viewResponse = await fetch(`http://127.0.0.1:5001/api/pos/${unifiedId}`);

    console.log(`📊 View response status: ${viewResponse.status} ${viewResponse.statusText}`);

    if (!viewResponse.ok) {
      const errorText = await viewResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      return;
    }

    const poDetails = await viewResponse.json();
    console.log('✅ Successfully retrieved CityMall PO details!');
    console.log('📋 PO Summary:', {
      id: poDetails.id,
      po_number: poDetails.po_number,
      platform: poDetails.platform?.pf_name,
      vendor_name: poDetails.vendor_name,
      total_amount: poDetails.total_amount,
      lines_count: poDetails.orderItems?.length || 0
    });

    if (poDetails.orderItems && poDetails.orderItems.length > 0) {
      console.log('📝 Sample line item:', {
        item_name: poDetails.orderItems[0].item_name,
        article_id: poDetails.orderItems[0].article_id,
        quantity: poDetails.orderItems[0].quantity,
        total_amount: poDetails.orderItems[0].total_amount
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCityMallView();