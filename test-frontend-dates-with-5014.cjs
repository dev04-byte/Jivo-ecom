const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFrontendDatesWithFixedBackend() {
  try {
    console.log('🎯 FRONTEND-BACKEND INTEGRATION TEST: Testing with fixed backend on port 5014');

    // Create form data with the actual Excel file
    const mockFormData = new FormData();

    // Try to read the Excel file if it exists
    const excelPath = 'c:\\Users\\singh\\Downloads\\Jivo Mart Private Limited_1187392 (1).xlsx';

    if (fs.existsSync(excelPath)) {
      console.log('✅ Found Excel file at:', excelPath);
      const fileBuffer = fs.readFileSync(excelPath);

      mockFormData.append('file', fileBuffer, {
        filename: 'Jivo Mart Private Limited_1187392 (1).xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      mockFormData.append('platform', 'dealshare');
      mockFormData.append('uploadedBy', 'frontend_integration_test');

      console.log('📤 Testing frontend preview endpoint with fixed backend (port 5014)...');

      // Test the preview endpoint that the frontend unified upload component would use
      const response = await axios.post('http://127.0.0.1:5014/api/po/preview', mockFormData, {
        headers: {
          ...mockFormData.getHeaders()
        },
        timeout: 30000
      });

      console.log('✅ Frontend Preview Response received:');
      console.log(`   Detected Vendor: ${response.data.detectedVendor}`);
      console.log(`   PO Number: ${response.data.header?.po_number || 'N/A'}`);

      if (response.data.header) {
        console.log('\n📅 DATES AS FRONTEND WOULD RECEIVE THEM:');
        console.log(`   Created Date (raw): ${response.data.header.po_created_date || 'NULL'}`);
        console.log(`   Delivery Date (raw): ${response.data.header.po_delivery_date || 'NULL'}`);
        console.log(`   Expiry Date (raw): ${response.data.header.po_expiry_date || 'NULL'}`);

        // This mimics what the frontend unified component does: .split('T')[0]
        const formatForFrontend = (dateValue) => {
          if (!dateValue) return 'Not available';
          return dateValue.toString().split('T')[0];
        };

        console.log('\n🎨 DATES AS FRONTEND WOULD DISPLAY THEM:');
        console.log(`   Created Date (display): ${formatForFrontend(response.data.header.po_created_date)}`);
        console.log(`   Delivery Date (display): ${formatForFrontend(response.data.header.po_delivery_date)}`);
        console.log(`   Expiry Date (display): ${formatForFrontend(response.data.header.po_expiry_date)}`);

        // Check if the displayed dates match Excel
        const expectedCreated = '2025-09-23';
        const expectedDelivery = '2025-09-23';
        const expectedExpiry = '2025-09-30';

        const displayedCreated = formatForFrontend(response.data.header.po_created_date);
        const displayedDelivery = formatForFrontend(response.data.header.po_delivery_date);
        const displayedExpiry = formatForFrontend(response.data.header.po_expiry_date);

        console.log('\n🎯 FRONTEND DISPLAY VERIFICATION:');
        console.log(`   Created date matches Excel: ${displayedCreated === expectedCreated ? '✅ YES' : '❌ NO'} (expected: ${expectedCreated}, got: ${displayedCreated})`);
        console.log(`   Delivery date matches Excel: ${displayedDelivery === expectedDelivery ? '✅ YES' : '❌ NO'} (expected: ${expectedDelivery}, got: ${displayedDelivery})`);
        console.log(`   Expiry date matches Excel: ${displayedExpiry === expectedExpiry ? '✅ YES' : '❌ NO'} (expected: ${expectedExpiry}, got: ${displayedExpiry})`);

        if (displayedCreated === expectedCreated && displayedDelivery === expectedDelivery && displayedExpiry === expectedExpiry) {
          console.log('\n🎉🎉🎉 FRONTEND INTEGRATION SUCCESS! 🎉🎉🎉');
          console.log('✅ Backend provides correct Excel dates');
          console.log('✅ Frontend displays correct Excel dates');
          console.log('✅ User will see correct dates in the UI when using fixed backend');
          console.log('\n💡 SOLUTION: Point frontend to the fixed backend (port 5014)');
          console.log('💡 OR: Apply the fix to the backend the frontend currently uses');
        } else {
          console.log('\n❌ Frontend integration still has issues');
        }
      }

    } else {
      console.log('❌ Excel file not found at:', excelPath);
      console.log('Please ensure the file exists at this location');
    }

  } catch (error) {
    console.error('❌ Frontend integration test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  }
}

testFrontendDatesWithFixedBackend();