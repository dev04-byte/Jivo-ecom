// Complete test script for Blinkit PDF to po_master/po_lines flow
import fs from 'fs';

async function testCompleteBlinkitFlow() {
  console.log('🧪 Testing Complete Blinkit PDF to Database Flow...\n');

  // Create comprehensive test data
  const testBlinkitData = {
    orderDetails: {
      poNumber: 'BL_COMPLETE_TEST_' + Date.now(),
      date: 'September 17, 2024',
      poType: 'PO',
      currency: 'INR',
      vendorNo: '1272',
      paymentTerms: '30 Days',
      expiryDate: 'September 24, 2024',
      deliveryDate: 'September 20, 2024'
    },
    vendor: {
      company: 'JIVO MART PRIVATE LIMITED',
      pan: 'AAFCJ4102J',
      gst: '07AAFCJ4102J1ZS',
      address: 'J-3/190, S/F RAJOURI GARDEN, NEW DELHI - 110027',
      contact: 'TANUJ KESWANI',
      phone: '91-9818805452',
      email: 'marketplace@jivo.in'
    },
    buyer: {
      company: 'HANDS ON TRADES PRIVATE LIMITED',
      pan: 'AADCH7038R',
      cin: 'U51909DL2015FTC285808',
      address: 'Khasra No. 274 Gha and 277 Cha Kuanwala, PO Harrawala, Dehradun',
      gst: '05AADCH7038R1Z3',
      contact: 'Durgesh Giri',
      phone: '+91 9068342018'
    },
    items: [
      {
        itemCode: 'JIVO_ORANGE_1L',
        hsnCode: '22029020',
        productUPC: 'UPC123456789',
        productDescription: 'Jivo Wellness Drink Orange (1 l)',
        basicCostPrice: 295,
        igstPercent: 12,
        cessPercent: 0,
        addtCess: 0,
        taxAmount: 35.4,
        landingRate: 330.4,
        quantity: 100,
        mrp: 400,
        marginPercent: 21.15,
        totalAmount: 33040
      },
      {
        itemCode: 'JIVO_CRANBERRY_1L',
        hsnCode: '22029020',
        productUPC: 'UPC987654321',
        productDescription: 'Jivo Wellness Drink Cranberry (1 l)',
        basicCostPrice: 295,
        igstPercent: 12,
        cessPercent: 0,
        addtCess: 0,
        taxAmount: 35.4,
        landingRate: 330.4,
        quantity: 75,
        mrp: 400,
        marginPercent: 21.15,
        totalAmount: 24780
      },
      {
        itemCode: 'JIVO_MANGO_1L',
        hsnCode: '22029020',
        productUPC: 'UPC555666777',
        productDescription: 'Jivo Wellness Drink Mango (1 l)',
        basicCostPrice: 295,
        igstPercent: 12,
        cessPercent: 0,
        addtCess: 0,
        taxAmount: 35.4,
        landingRate: 330.4,
        quantity: 50,
        mrp: 400,
        marginPercent: 21.15,
        totalAmount: 16520
      }
    ],
    summary: {
      totalQuantity: 225,
      totalItems: 3,
      totalWeight: '0.225',
      totalAmount: 74340,
      cartDiscount: 0,
      netAmount: 74340
    }
  };

  console.log('📋 Test Data Summary:');
  console.log(`   PO Number: ${testBlinkitData.orderDetails.poNumber}`);
  console.log(`   Total Items: ${testBlinkitData.items.length}`);
  console.log(`   Total Quantity: ${testBlinkitData.summary.totalQuantity}`);
  console.log(`   Total Amount: ₹${testBlinkitData.summary.totalAmount.toLocaleString()}`);
  console.log(`   Products: ${testBlinkitData.items.map(item => item.itemCode).join(', ')}`);

  // Save comprehensive test data
  const testFiles = {
    'blinkit-complete-test-data.json': testBlinkitData,
    'curl-test-command.sh': `#!/bin/bash
# Test command to upload Blinkit PDF data via API
curl -X POST http://localhost:5000/api/unified-po/upload \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    platform: 'blinkit',
    pdfData: testBlinkitData
  }, null, 2)}'`,
    'postman-test.json': {
      method: 'POST',
      url: 'http://localhost:5000/api/unified-po/upload',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        platform: 'blinkit',
        pdfData: testBlinkitData
      }
    }
  };

  // Write test files
  Object.entries(testFiles).forEach(([filename, content]) => {
    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(filename, fileContent);
    console.log(`💾 Created: ${filename}`);
  });

  console.log('\n🚀 Testing Instructions:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Ensure database is running and properly configured');
  console.log('3. Use one of the following methods to test:');
  console.log('   a) Frontend: Use the unified PO upload page');
  console.log('   b) API: Use the curl command from curl-test-command.sh');
  console.log('   c) Postman: Import postman-test.json configuration');

  console.log('\n📊 Expected Database Results:');
  console.log('After successful upload, check these tables:');
  console.log('');
  console.log('🔍 blinkit_po_header:');
  console.log(`   SELECT * FROM blinkit_po_header WHERE po_number = '${testBlinkitData.orderDetails.poNumber}';`);
  console.log('   Expected: 1 record with Blinkit-specific data');
  console.log('');
  console.log('🔍 blinkit_po_lines:');
  console.log(`   SELECT * FROM blinkit_po_lines WHERE header_id = (SELECT id FROM blinkit_po_header WHERE po_number = '${testBlinkitData.orderDetails.poNumber}');`);
  console.log('   Expected: 3 records (Orange, Cranberry, Mango)');
  console.log('');
  console.log('🔍 po_master:');
  console.log(`   SELECT * FROM po_master WHERE vendor_po_number = '${testBlinkitData.orderDetails.poNumber}' AND series = 'Blinkit';`);
  console.log('   Expected: 1 record with unified data format');
  console.log('');
  console.log('🔍 po_lines:');
  console.log(`   SELECT * FROM po_lines WHERE po_id = (SELECT id FROM po_master WHERE vendor_po_number = '${testBlinkitData.orderDetails.poNumber}');`);
  console.log('   Expected: 3 records with platform_product_code_id references');
  console.log('');
  console.log('🔍 pf_item_mst:');
  console.log(`   SELECT * FROM pf_item_mst WHERE pf_id = (SELECT id FROM pf_mst WHERE pf_name = 'Blinkit') AND pf_itemcode IN ('JIVO_ORANGE_1L', 'JIVO_CRANBERRY_1L', 'JIVO_MANGO_1L');`);
  console.log('   Expected: 3 records for the Blinkit platform products');
  console.log('');
  console.log('🔍 pf_mst:');
  console.log(`   SELECT * FROM pf_mst WHERE pf_name = 'Blinkit';`);
  console.log('   Expected: 1 record for Blinkit platform');

  console.log('\n⚡ Console Logs to Watch:');
  console.log('When testing, look for these console messages:');
  console.log('✅ "📋 Inserting Blinkit PO ... into po_master and po_lines tables"');
  console.log('✅ "✅ Found platform \'Blinkit\' with ID: X" or "✅ Created new platform"');
  console.log('✅ "✅ Created po_master record with ID: X"');
  console.log('✅ "📦 Processing X line items for po_lines table"');
  console.log('✅ "✅ Successfully inserted X line items into po_lines table"');
  console.log('✅ "✅ Successfully completed po_master and po_lines insertion"');

  console.log('\n🛠️ Troubleshooting:');
  console.log('If you see errors:');
  console.log('❌ Platform not found: Run the platform seed script');
  console.log('❌ Distributor not found: The function will auto-create a default distributor');
  console.log('❌ Foreign key constraint: Check database schema and relationships');
  console.log('❌ Date parsing errors: Check that dates are in valid format');

  console.log('\n✅ Complete test setup ready!');
  console.log('🎯 Goal: Data should appear in BOTH Blinkit tables AND unified po_master/po_lines tables');
}

testCompleteBlinkitFlow().catch(console.error);