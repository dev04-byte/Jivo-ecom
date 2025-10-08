const axios = require('axios');

async function testBigBasketView() {
  const baseUrl = 'http://localhost:5001';
  const poId = 12000101;
  const actualId = poId - 12000000; // Should be 101

  console.log('\n🧪 Testing BigBasket PO View Flow\n');
  console.log('='.repeat(60));
  console.log(`\n📌 Testing with PO ID: ${poId}`);
  console.log(`📌 Actual BigBasket ID: ${actualId}`);

  try {
    // Simulate the first fetch (what the frontend does)
    console.log(`\n📋 Step 1: Fetching from /api/pos/${poId} (unified table)`);
    const unifiedResponse = await axios.get(`${baseUrl}/api/pos/${poId}`);
    console.log('✅ Unified response:');
    console.log(`  - PO Number: ${unifiedResponse.data.po_number}`);
    console.log(`  - Platform: ${unifiedResponse.data.platform?.pf_name}`);
    console.log(`  - Has orderItems: ${!!unifiedResponse.data.orderItems}`);
    console.log(`  - OrderItems count: ${unifiedResponse.data.orderItems?.length || 0}`);
    console.log(`  - Has header property: ${!!unifiedResponse.data.header}`);
    console.log(`  - Has lines property: ${!!unifiedResponse.data.lines}`);

    // Check if it's BigBasket
    const isBigBasket = unifiedResponse.data.platform?.pf_name?.toLowerCase().includes('bigbasket');
    console.log(`\n🔍 Is BigBasket: ${isBigBasket}`);

    if (isBigBasket) {
      // Simulate the second fetch (detailed data)
      const poNumber = unifiedResponse.data.po_number;
      console.log(`\n📋 Step 2: Fetching from /api/bigbasket-pos/by-number/${poNumber}`);
      const detailedResponse = await axios.get(`${baseUrl}/api/bigbasket-pos/by-number/${poNumber}`);

      console.log('✅ Detailed response:');
      console.log(`  - Has header: ${!!detailedResponse.data.header}`);
      console.log(`  - Has lines: ${!!detailedResponse.data.lines}`);
      console.log(`  - Lines count: ${detailedResponse.data.lines?.length || 0}`);

      if (detailedResponse.data.header) {
        console.log(`\n📄 Header Data:`);
        console.log(`  - PO Number: ${detailedResponse.data.header.po_number}`);
        console.log(`  - Supplier: ${detailedResponse.data.header.supplier_name}`);
        console.log(`  - Total Items: ${detailedResponse.data.header.total_items}`);
        console.log(`  - Total Quantity: ${detailedResponse.data.header.total_quantity}`);
        console.log(`  - Grand Total: ₹${detailedResponse.data.header.grand_total}`);
      }

      if (detailedResponse.data.lines && detailedResponse.data.lines.length > 0) {
        console.log(`\n📦 Line Items Sample (first 2):`);
        detailedResponse.data.lines.slice(0, 2).forEach((line, idx) => {
          console.log(`\n  Item ${idx + 1}:`);
          console.log(`    - SKU: ${line.sku_code}`);
          console.log(`    - Description: ${line.description?.substring(0, 40)}...`);
          console.log(`    - Quantity: ${line.quantity}`);
          console.log(`    - Basic Cost: ${line.basic_cost}`);
          console.log(`    - GST Amount: ${line.gst_amount}`);
          console.log(`    - Total Value: ${line.total_value}`);
        });

        // Calculate totals
        let totalQty = 0;
        let totalBasicCost = 0;
        let totalGST = 0;
        let grandTotal = 0;

        detailedResponse.data.lines.forEach(line => {
          const qty = Number(line.quantity) || 0;
          const basicCost = Number(line.basic_cost) || 0;
          const gst = Number(line.gst_amount) || 0;
          const total = Number(line.total_value) || 0;

          totalQty += qty;
          totalBasicCost += basicCost * qty;
          totalGST += gst;
          grandTotal += total;
        });

        console.log(`\n💰 Calculated Totals:`);
        console.log(`  - Total Items: ${detailedResponse.data.lines.length}`);
        console.log(`  - Total Quantity: ${totalQty}`);
        console.log(`  - Total Basic Cost: ₹${totalBasicCost.toFixed(2)}`);
        console.log(`  - Total GST: ₹${totalGST.toFixed(2)}`);
        console.log(`  - Grand Total: ₹${grandTotal.toFixed(2)}`);

        console.log(`\n✅ Frontend should display:`);
        console.log(`  - Total Items: ${detailedResponse.data.lines.length}`);
        console.log(`  - Total Quantity: ${totalQty}`);
        console.log(`  - Total Value: ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.log('\n❌ Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

testBigBasketView();
