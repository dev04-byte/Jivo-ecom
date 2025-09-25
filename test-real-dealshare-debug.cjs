const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testRealDealshareDebug() {
  try {
    console.log('🔍 REAL DEALSHARE DEBUG: Testing with actual Excel file');

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
      mockFormData.append('uploadedBy', 'debug_real_tester');

      console.log('📤 Uploading actual DealShare Excel file for debugging...');

      const response = await axios.post('http://127.0.0.1:5012/api/po/preview', mockFormData, {
        headers: {
          ...mockFormData.getHeaders()
        },
        timeout: 30000
      });

      console.log('✅ Preview Response received:');
      console.log(`   Detected Vendor: ${response.data.detectedVendor}`);
      console.log(`   PO Number: ${response.data.header?.po_number || 'N/A'}`);

      if (response.data.header) {
        console.log('\n📅 EXTRACTED DATES FROM REAL EXCEL:');
        console.log(`   Created Date: ${response.data.header.po_created_date || 'NULL'}`);
        console.log(`   Delivery Date: ${response.data.header.po_delivery_date || 'NULL'}`);
        console.log(`   Expiry Date: ${response.data.header.po_expiry_date || 'NULL'}`);

        console.log('\n🔍 Full Header Object:');
        console.log(JSON.stringify(response.data.header, null, 2));
      }

    } else {
      console.log('❌ Excel file not found at:', excelPath);
      console.log('Please ensure the file exists at this location');
    }

  } catch (error) {
    console.error('❌ Real DealShare debug failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  }
}

testRealDealshareDebug();