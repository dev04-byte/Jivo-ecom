const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testCityMallAPI() {
  console.log('🧪 Testing CityMall API Preview Response\n');
  console.log('='.repeat(80));

  try {
    const fileBuffer = fs.readFileSync('c:\Users\singh\Downloads\PO-1359161.xlsx');

    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: 'PO-1359161.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    form.append('platform', 'citymall');

    console.log('📤 Sending request to http://localhost:5001/api/po/preview');
    const response = await fetch('http://localhost:5001/api/po/preview', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', error);
      return;
    }

    const data = await response.json();

    console.log('\n📊 API RESPONSE:\n');
    console.log('='.repeat(80));
    console.log('\n📋 HEADER:');
    console.log(JSON.stringify(data.header, null, 2));

    console.log('\n📦 FIRST 2 LINE ITEMS:');
    if (data.lines && data.lines.length > 0) {
      console.log('Item 1:', JSON.stringify(data.lines[0], null, 2));
      if (data.lines.length > 1) {
        console.log('\nItem 2:', JSON.stringify(data.lines[1], null, 2));
      }
    }

    console.log('\n📈 SUMMARY:');
    console.log(`Total Lines: ${data.lines?.length || 0}`);
    console.log(`Total Quantity: ${data.totalQuantity || 0}`);
    console.log(`Total Amount: ${data.totalAmount || 0}`);

    console.log('\n🔍 FIELD CHECK (First item):');
    if (data.lines && data.lines.length > 0) {
      const firstLine = data.lines[0];
      console.log(`  article_id: ${firstLine.article_id || 'MISSING'}`);
      console.log(`  article_name: ${firstLine.article_name || 'MISSING'}`);
      console.log(`  hsn_code: ${firstLine.hsn_code || 'MISSING'}`);
      console.log(`  quantity: ${firstLine.quantity || 'MISSING'}`);
      console.log(`  base_cost_price: ${firstLine.base_cost_price || 'MISSING'}`);
      console.log(`  mrp: ${firstLine.mrp || 'MISSING'}`);
      console.log(`  total_amount: ${firstLine.total_amount || 'MISSING'}`);
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCityMallAPI();
