// Test script to verify Blinkit PO data is correctly inserted into po_master and po_lines
import fs from 'fs';

async function testBlinkitIntegration() {
  console.log('🧪 Testing Blinkit PO to po_master/po_lines integration...');

  // Mock PDF data that would come from the frontend
  const mockBlinkitPdfData = {
    orderDetails: {
      poNumber: 'BL_TEST_' + Date.now(),
      date: 'Sept. 10, 2024',
      poType: 'PO',
      currency: 'INR',
      vendorNo: '1272',
      paymentTerms: '30 Days',
      expiryDate: 'Sept. 17, 2024',
      deliveryDate: 'Sept. 15, 2024'
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
        itemCode: 'JIVO_001',
        hsnCode: '22029020',
        productUPC: 'UPC123456',
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
        itemCode: 'JIVO_002',
        hsnCode: '22029020',
        productUPC: 'UPC789012',
        productDescription: 'Jivo Wellness Drink Cranberry (1 l)',
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
      totalQuantity: 150,
      totalItems: 2,
      totalWeight: '0.150',
      totalAmount: 49560,
      cartDiscount: 0,
      netAmount: 49560
    }
  };

  console.log('📝 Mock data prepared:');
  console.log(`   PO Number: ${mockBlinkitPdfData.orderDetails.poNumber}`);
  console.log(`   Items: ${mockBlinkitPdfData.items.length}`);
  console.log(`   Total Amount: ${mockBlinkitPdfData.summary.totalAmount}`);

  // Save test data to a file that can be used for manual testing
  const testDataFile = 'blinkit-test-data.json';
  fs.writeFileSync(testDataFile, JSON.stringify(mockBlinkitPdfData, null, 2));
  console.log(`💾 Test data saved to: ${testDataFile}`);

  console.log('\n🚀 To test the integration:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Use the unified PO upload endpoint with this test data');
  console.log('3. Check the database for records in:');
  console.log('   - blinkit_po_header (original data)');
  console.log('   - blinkit_po_lines (original data)');
  console.log('   - po_master (new unified data)');
  console.log('   - po_lines (new unified data)');
  console.log('   - pf_item_mst (product entries for Blinkit platform)');

  console.log('\n📊 Expected database entries:');
  console.log(`   - 1 record in blinkit_po_header with po_number: ${mockBlinkitPdfData.orderDetails.poNumber}`);
  console.log(`   - 2 records in blinkit_po_lines`);
  console.log(`   - 1 record in po_master with vendor_po_number: ${mockBlinkitPdfData.orderDetails.poNumber}`);
  console.log(`   - 2 records in po_lines`);
  console.log(`   - 2 records in pf_item_mst for Blinkit platform (JIVO_001, JIVO_002)`);

  console.log('\n✅ Test preparation complete!');
}

testBlinkitIntegration().catch(console.error);