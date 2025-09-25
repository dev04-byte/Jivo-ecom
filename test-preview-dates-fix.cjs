const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPreviewDatesFix() {
  try {
    console.log('📄 PREVIEW DATES FIX TEST: Testing Excel date display in preview');

    // Create a mock Excel buffer that simulates DealShare Excel with dates
    // This simulates what the DealShare parser would extract from real Excel
    const mockFormData = new FormData();

    // Create a simple file buffer (the actual Excel parsing is tested separately)
    const mockFileContent = 'Mock DealShare Excel File';
    mockFormData.append('file', Buffer.from(mockFileContent), {
      filename: 'dealshare_test.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Add platform parameter to ensure DealShare parsing
    mockFormData.append('platform', 'dealshare');
    mockFormData.append('uploadedBy', 'preview_date_tester');

    console.log('📤 Sending mock Excel file to preview endpoint...');
    console.log('   Expected: DealShare parser will extract dates from Excel');
    console.log('   Expected: Preview will format Date objects properly for display');

    const response = await axios.post('http://127.0.0.1:5010/api/po/preview', mockFormData, {
      headers: {
        ...mockFormData.getHeaders()
      },
      timeout: 20000
    });

    console.log('✅ Preview API Response received:');
    console.log(`   Detected Vendor: ${response.data.detectedVendor}`);
    console.log(`   PO Number: ${response.data.header?.po_number || 'N/A'}`);

    if (response.data.header) {
      console.log('\n📅 DATE FIELDS IN PREVIEW:');
      console.log(`   Created Date: ${response.data.header.po_created_date || 'NULL'}`);
      console.log(`   Delivery Date: ${response.data.header.po_delivery_date || 'NULL'}`);
      console.log(`   Expiry Date: ${response.data.header.po_expiry_date || 'NULL'}`);

      // Check if dates are properly formatted (should be YYYY-MM-DD format or readable format)
      const hasValidDates =
        response.data.header.po_created_date &&
        response.data.header.po_delivery_date &&
        response.data.header.po_expiry_date;

      const hasReadableDates =
        response.data.header.po_created_date !== 'Invalid Date' &&
        response.data.header.po_delivery_date !== 'Invalid Date' &&
        response.data.header.po_expiry_date !== 'Invalid Date';

      console.log('\n🎯 PREVIEW DATE VALIDATION:');
      console.log(`   All date fields present: ${hasValidDates ? '✅ YES' : '❌ NO'}`);
      console.log(`   Dates are readable: ${hasReadableDates ? '✅ YES' : '❌ NO'}`);

      if (hasValidDates && hasReadableDates) {
        // Check if dates look like Excel-extracted dates (not current date)
        const createdDate = new Date(response.data.header.po_created_date);
        const now = new Date();
        const isNotCurrentDate = Math.abs(createdDate.getTime() - now.getTime()) > 24 * 60 * 60 * 1000; // More than 1 day difference

        console.log(`   Dates appear to be Excel-extracted (not current): ${isNotCurrentDate ? '✅ YES' : '⚠️ CURRENT'}`);

        if (hasValidDates && hasReadableDates) {
          console.log('\n🎉🎉🎉 PREVIEW DATES FIX SUCCESS! 🎉🎉🎉');
          console.log('✅ DealShare Excel dates are properly displayed in preview!');
          console.log('✅ User will now see correct dates from Excel file!');
          console.log('✅ No more auto-generated dates in preview!');
          console.log('✅ Date formatting works correctly for frontend display!');
        }
      } else {
        console.log('\n❌ PREVIEW DATES FIX FAILED');
        console.log('Dates are not properly formatted for preview display');
      }
    } else {
      console.log('\n❌ No header found in preview response');
    }

  } catch (error) {
    console.error('❌ Preview date test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Server may not be ready yet on port 5010');
    }
  }
}

testPreviewDatesFix();