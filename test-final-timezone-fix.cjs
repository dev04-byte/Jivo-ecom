const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testFinalTimezoneFix() {
  try {
    console.log('🌍 FINAL TIMEZONE FIX: Testing UTC date creation to avoid timezone issues');

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
      mockFormData.append('uploadedBy', 'timezone_fix_tester');

      console.log('📤 Uploading to timezone-fixed server (port 5014) for testing...');

      const response = await axios.post('http://127.0.0.1:5014/api/po/preview', mockFormData, {
        headers: {
          ...mockFormData.getHeaders()
        },
        timeout: 30000
      });

      console.log('✅ Timezone-Fixed Preview Response received:');
      console.log(`   Detected Vendor: ${response.data.detectedVendor}`);
      console.log(`   PO Number: ${response.data.header?.po_number || 'N/A'}`);

      if (response.data.header) {
        console.log('\n📅 EXTRACTED DATES FROM TIMEZONE-FIXED PARSER:');
        console.log(`   Created Date: ${response.data.header.po_created_date || 'NULL'}`);
        console.log(`   Delivery Date: ${response.data.header.po_delivery_date || 'NULL'}`);
        console.log(`   Expiry Date: ${response.data.header.po_expiry_date || 'NULL'}`);

        // Check if the dates are now correct with timezone fix
        const expectedCreatedDate = '2025-09-23'; // From Excel: 23-09-2025
        const expectedDeliveryDate = '2025-09-23'; // From Excel: 23-09-2025
        const expectedExpiryDate = '2025-09-30'; // From Excel: 30-09-2025

        const createdCorrect = response.data.header.po_created_date === expectedCreatedDate;
        const deliveryCorrect = response.data.header.po_delivery_date === expectedDeliveryDate;
        const expiryCorrect = response.data.header.po_expiry_date === expectedExpiryDate;

        console.log('\n🎯 TIMEZONE-FIXED DATE VERIFICATION:');
        console.log(`   Created date correct: ${createdCorrect ? '✅ YES' : '❌ NO'} (expected: ${expectedCreatedDate}, got: ${response.data.header.po_created_date})`);
        console.log(`   Delivery date correct: ${deliveryCorrect ? '✅ YES' : '❌ NO'} (expected: ${expectedDeliveryDate}, got: ${response.data.header.po_delivery_date})`);
        console.log(`   Expiry date correct: ${expiryCorrect ? '✅ YES' : '❌ NO'} (expected: ${expectedExpiryDate}, got: ${response.data.header.po_expiry_date})`);

        if (createdCorrect && deliveryCorrect && expiryCorrect) {
          console.log('\n🎉🎉🎉 COMPLETE SUCCESS! PROBLEM SOLVED! 🎉🎉🎉');
          console.log('✅ Excel dates are now perfectly extracted and displayed!');
          console.log('✅ Timezone issues resolved with UTC date creation!');
          console.log('✅ The user will see correct dates matching their Excel files!');
          console.log('✅ Issue fixed: "again it take current date not get from excel fix this"');
          console.log('\n💯 DEALSHARE EXCEL DATE EXTRACTION IS NOW FULLY FUNCTIONAL!');
        } else {
          console.log('\n❌ STILL NEEDS MORE WORK: Some dates are not correctly parsed');
          console.log('   This might require additional investigation into date formatting');
        }
      }

    } else {
      console.log('❌ Excel file not found at:', excelPath);
      console.log('Please ensure the file exists at this location');
    }

  } catch (error) {
    console.error('❌ Timezone fix test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  }
}

testFinalTimezoneFix();