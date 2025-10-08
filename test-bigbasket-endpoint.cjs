const axios = require('axios');

async function testBigBasketEndpoint() {
  const baseUrl = 'http://localhost:5001';

  console.log('\n🧪 Testing BigBasket Endpoints\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Get all BigBasket POs from unified table
    console.log('\n📋 Test 1: Fetching from unified /api/pos');
    const unifiedResponse = await axios.get(`${baseUrl}/api/pos`);
    const bigbasketPOs = unifiedResponse.data.filter(po =>
      po.platform?.pf_name?.toLowerCase().includes('bigbasket')
    );

    if (bigbasketPOs.length > 0) {
      console.log(`✅ Found ${bigbasketPOs.length} BigBasket POs in unified table`);
      const firstPO = bigbasketPOs[0];
      console.log('\nFirst BigBasket PO from unified table:');
      console.log(`  - ID: ${firstPO.id}`);
      console.log(`  - PO Number: ${firstPO.po_number}`);
      console.log(`  - Platform: ${firstPO.platform?.pf_name}`);
      console.log(`  - Order Items Count: ${firstPO.orderItems?.length || 0}`);

      // Test 2: Fetch this PO by ID from unified endpoint
      console.log(`\n📋 Test 2: Fetching PO ${firstPO.id} from /api/pos/${firstPO.id}`);
      const poResponse = await axios.get(`${baseUrl}/api/pos/${firstPO.id}`);
      console.log('✅ Response structure:');
      console.log(`  - Has po_number: ${!!poResponse.data.po_number}`);
      console.log(`  - Has platform: ${!!poResponse.data.platform}`);
      console.log(`  - Platform name: ${poResponse.data.platform?.pf_name}`);
      console.log(`  - Has orderItems: ${!!poResponse.data.orderItems}`);
      console.log(`  - OrderItems count: ${poResponse.data.orderItems?.length || 0}`);
      console.log(`  - Has header: ${!!poResponse.data.header}`);
      console.log(`  - Has lines: ${!!poResponse.data.lines}`);

      // Test 3: Fetch by PO number from BigBasket-specific endpoint
      console.log(`\n📋 Test 3: Fetching from /api/bigbasket-pos/by-number/${firstPO.po_number}`);
      try {
        const detailedResponse = await axios.get(`${baseUrl}/api/bigbasket-pos/by-number/${firstPO.po_number}`);
        console.log('✅ Response structure:');
        console.log(`  - Has header: ${!!detailedResponse.data.header}`);
        console.log(`  - Has lines: ${!!detailedResponse.data.lines}`);
        console.log(`  - Header PO Number: ${detailedResponse.data.header?.po_number}`);
        console.log(`  - Lines count: ${detailedResponse.data.lines?.length || 0}`);

        if (detailedResponse.data.lines && detailedResponse.data.lines.length > 0) {
          const firstLine = detailedResponse.data.lines[0];
          console.log('\n  First line item fields:');
          console.log(`    - quantity: ${firstLine.quantity}`);
          console.log(`    - basic_cost: ${firstLine.basic_cost}`);
          console.log(`    - gst_amount: ${firstLine.gst_amount}`);
          console.log(`    - total_value: ${firstLine.total_value}`);

          // Calculate totals
          let totalQuantity = 0;
          let grandTotal = 0;
          detailedResponse.data.lines.forEach(line => {
            totalQuantity += Number(line.quantity) || 0;
            grandTotal += Number(line.total_value) || 0;
          });
          console.log('\n  📊 Calculated Totals:');
          console.log(`    - Total Quantity: ${totalQuantity}`);
          console.log(`    - Grand Total: ₹${grandTotal.toFixed(2)}`);
        }
      } catch (error) {
        console.log('❌ Error fetching by PO number:', error.response?.data || error.message);
      }

    } else {
      console.log('❌ No BigBasket POs found in unified table');

      // Check BigBasket-specific table directly
      console.log('\n📋 Checking bigbasket_po_header table directly...');
      const query = `SELECT id, po_number, supplier_name, total_quantity, grand_total FROM bigbasket_po_header LIMIT 5`;
      console.log('Please run this SQL query manually:', query);
    }

  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

testBigBasketEndpoint();
