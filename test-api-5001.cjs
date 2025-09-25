const fs = require('fs');

// Test the CityMall parsing API on new port
async function testCityMallAPI() {
  try {
    const filePath = 'C:\\Users\\singh\\Downloads\\Purchase Order PO-1357102 (2).xlsx';
    const fileBuffer = fs.readFileSync(filePath);

    const FormData = require('form-data');
    const fetch = require('node-fetch');

    const formData = new FormData();
    formData.append('csvFile', fileBuffer, {
      filename: 'Purchase Order PO-1357102 (2).xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    console.log('Testing CityMall API endpoint on port 5001...');
    const startTime = Date.now();

    const response = await fetch('http://localhost:5001/api/parse-city-mall-csv', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const duration = Date.now() - startTime;
    console.log(`Response received in ${duration}ms`);
    console.log('Status:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS!');
      console.log('PO Number:', result.header?.po_number);
      console.log('Vendor:', result.header?.vendor_name);
      console.log('Line Items:', result.lines?.length);
      console.log('Total Amount:', result.header?.total_amount);
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR:', errorText);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testCityMallAPI();