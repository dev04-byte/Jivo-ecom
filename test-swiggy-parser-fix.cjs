const fs = require('fs');

// Test the fixed Swiggy parser directly
async function testSwiggyParserFix() {
  try {
    console.log('🔄 Testing Swiggy parser fix...');

    // Read the real Swiggy CSV file
    const csvPath = 'C:\\Users\\singh\\Downloads\\SWIGGY1758952908646.csv';

    if (!fs.existsSync(csvPath)) {
      console.log('❌ CSV file not found, using mock data for test');

      // Create mock multi-PO CSV content
      const mockCsvContent = `PoNumber,Entity,FacilityId,FacilityName,City,PoCreatedAt,PoModifiedAt,Status,SupplierCode,VendorName,PoAmount,SkuCode,SkuDescription,CategoryId,OrderedQty,ReceivedQty,BalancedQty,Tax,PoLineValueWithoutTax,PoLineValueWithTax,Mrp,UnitBasedCost,ExpectedDeliveryDate,PoExpiryDate,OtbReferenceNumber,InternalExternalPo,PoAgeing,BrandName,ReferencePoNumber
CPDPO189177,SCOOTSY LOGISTICS,CPD,PUN Delhivery,PUNE,2025-09-27 02:26:29,2025-09-27 02:26:30,CONFIRMED,85235374,CHIRAG ENTERPRISES,214530.00,15686,Jivo Canola Oil 5L,"Edible Oils",6,0,6,378.00,7560.00,7938.00,1650.00,1260.00,2025-10-11,2025-10-14,REF123,external,0,Jivo,
CPDPO189177,SCOOTSY LOGISTICS,CPD,PUN Delhivery,PUNE,2025-09-27 02:26:29,2025-09-27 02:26:30,CONFIRMED,85235374,CHIRAG ENTERPRISES,214530.00,15687,Jivo Olive Oil 1L,"Olive Oil",32,0,32,807.62,16152.38,16960.00,1499.00,504.76,2025-10-11,2025-10-14,REF123,external,0,Jivo,
MBIPO256502,SCOOTSY LOGISTICS,MBI,BLR IM1,BANGALORE,2025-09-24 10:15:10,2025-09-24 10:31:58,COMPLETED,79934149,KNOWTABLE SERVICES,61344.00,21709,Jivo Pomace Oil 1L,"Edible Oils",32,32,0,635.43,12708.57,13344.00,1049.00,397.14,2025-09-25,2025-09-26,REF456,internal,3,Jivo,
MBIPO256502,SCOOTSY LOGISTICS,MBI,BLR IM1,BANGALORE,2025-09-24 10:15:10,2025-09-24 10:31:58,COMPLETED,79934149,KNOWTABLE SERVICES,61344.00,390730,Jivo Groundnut Oil 1L,"Edible Oils",32,32,0,304.76,6095.24,6400.00,560.00,190.48,2025-09-25,2025-09-26,REF456,internal,3,Jivo,`;

      // Test the parser directly
      const { parseSwiggyCSVPO } = require('./server/swiggy-csv-parser-new.ts');
      const result = parseSwiggyCSVPO(mockCsvContent, 'system');

      console.log('✅ Parser test completed successfully!');
      console.log('📊 Result structure:', {
        hasPoList: !!result.poList,
        hasSinglePO: !!(result.header && result.lines),
        totalPOs: result.totalPOs || 1,
        totalItems: result.totalItems || result.lines?.length || 0
      });

      if (result.poList) {
        console.log('📋 Multiple POs detected:', result.poList.length);
        result.poList.forEach((po, index) => {
          console.log(`  PO ${index + 1}: ${po.header.PoNumber} - ${po.lines.length} items`);
        });
      } else {
        console.log('📋 Single PO detected:', result.header?.PoNumber, '-', result.lines?.length, 'items');
      }

      return result;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('📄 CSV file loaded, size:', csvContent.length, 'characters');

    // Import and test the parser
    const { parseSwiggyCSVPO } = require('./server/swiggy-csv-parser-new.ts');
    const result = parseSwiggyCSVPO(csvContent, 'system');

    console.log('✅ Real CSV parsing successful!');
    console.log('📊 Result structure:', {
      hasPoList: !!result.poList,
      hasSinglePO: !!(result.header && result.lines),
      totalPOs: result.totalPOs || 1,
      totalItems: result.totalItems || result.lines?.length || 0
    });

    if (result.poList) {
      console.log('📋 Multiple POs detected:', result.poList.length);
      result.poList.slice(0, 3).forEach((po, index) => {
        console.log(`  PO ${index + 1}: ${po.header.PoNumber} - ${po.lines.length} items - ₹${po.header.PoAmount}`);
      });
      if (result.poList.length > 3) {
        console.log(`  ... and ${result.poList.length - 3} more POs`);
      }
    } else {
      console.log('📋 Single PO detected:', result.header?.PoNumber, '-', result.lines?.length, 'items');
    }

    return result;

  } catch (error) {
    console.error('❌ Parser test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

testSwiggyParserFix();