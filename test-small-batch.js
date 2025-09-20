import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testSmallBatch() {
  console.log('🧪 Testing small batch import...');

  try {
    // Create a small CSV with just 2 POs for testing
    const testCSV = `PoNumber,Entity,FacilityId,FacilityName,City,PoCreatedAt,PoModifiedAt,Status,SupplierCode,VendorName,PoAmount,SkuCode,SkuDescription,CategoryId,OrderedQty,ReceivedQty,BalancedQty,Tax,PoLineValueWithoutTax,PoLineValueWithTax,Mrp,UnitBasedCost,ExpectedDeliveryDate,PoExpiryDate,OtbReferenceNumber,InternalExternalPo,PoAgeing,BrandName,ReferencePoNumber
TESTPO001,TEST LOGISTICS,TST,Test Facility,TEST CITY,2025-09-18 20:09:28,2025-09-18 20:09:28,CONFIRMED,12345,TEST VENDOR,1000.00,ITEM001,Test Item 1,Test Category,5,0,5,50.00,500.00,550.00,150.00,100.00,2025-09-29,2025-10-02,TEST_REF,external,0,Test Brand,
TESTPO002,TEST LOGISTICS,TST,Test Facility,TEST CITY,2025-09-19 20:09:28,2025-09-19 20:09:28,CONFIRMED,12345,TEST VENDOR,2000.00,ITEM002,Test Item 2,Test Category,10,0,10,100.00,1000.00,1100.00,200.00,100.00,2025-09-30,2025-10-03,TEST_REF2,external,0,Test Brand,`;

    // Test preview endpoint
    console.log('📋 Testing preview with small CSV...');

    const formData = new FormData();
    formData.append('file', Buffer.from(testCSV), {
      filename: 'test-small.csv',
      contentType: 'text/csv'
    });

    const previewResponse = await fetch('http://localhost:5000/api/swiggy-pos/preview', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log(`📤 Preview response status: ${previewResponse.status}`);

    if (!previewResponse.ok) {
      const errorText = await previewResponse.text();
      console.error('❌ Preview failed:', errorText);
      return;
    }

    const previewResult = await previewResponse.json();
    console.log('✅ Preview successful!');
    console.log(`📊 Found ${previewResult.totalPOs} POs`);

    // Test confirm-insert with small batch
    console.log('\n🔄 Testing confirm-insert with small batch...');

    const confirmResponse = await fetch('http://localhost:5000/api/swiggy/confirm-insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poList: previewResult.poList
      })
    });

    console.log(`📤 Confirm response status: ${confirmResponse.status}`);

    const responseText = await confirmResponse.text();
    console.log('📄 Raw confirm response:', responseText);

    try {
      const confirmResult = JSON.parse(responseText);

      if (confirmResponse.ok) {
        console.log('✅ Confirm insert successful!');
        console.log(`📊 Results: Success: ${confirmResult.successCount}, Failed: ${confirmResult.failureCount}, Duplicates: ${confirmResult.duplicateCount || 0}`);
      } else {
        console.log('❌ Confirm insert failed!');
      }

      if (confirmResult.results && confirmResult.results.length > 0) {
        console.log('📋 Detailed results:');
        confirmResult.results.forEach(result => {
          console.log(`  ${result.po_number}: ${result.status} - ${result.message?.substring(0, 200)}`);
        });
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON response');
      console.error('💥 Parse error:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Error in test:', error.message);
  }
}

testSmallBatch().catch(console.error);