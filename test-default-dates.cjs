const axios = require('axios');
const { Client } = require('pg');

async function testDefaultDates() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('📅 DEFAULT DATE TEST: Testing default date generation when Excel has no dates');
    await client.connect();

    // Clean test data
    await client.query(`DELETE FROM dealshare_po_lines WHERE po_header_id IN (SELECT id FROM dealshare_po_header WHERE po_number LIKE '%DEFAULT_DATE%')`);
    await client.query(`DELETE FROM dealshare_po_header WHERE po_number LIKE '%DEFAULT_DATE%'`);

    // Test without any date fields (should generate defaults)
    console.log('\n🧪 TEST: No dates provided - should generate defaults');

    const testData = {
      header: {
        po_number: 'DEFAULT_DATE_TEST_001',
        uploaded_by: 'default_date_tester',
        total_items: 1,
        total_quantity: '50',
        total_gross_amount: '2500.00',
        comments: 'Testing default date generation'
        // NO date fields provided
      },
      lines: [{
        line_number: 1,
        sku: 'DEFAULT_DATE_SKU_001',
        product_name: 'Default Date Test Product',
        quantity: 50,
        gross_amount: '2500.00'
      }]
    };

    console.log('📤 Sending test WITHOUT any date fields...');

    const startTime = new Date();

    const response = await axios.post('http://127.0.0.1:5009/api/po/import/dealshare', testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });

    console.log('✅ API Response received:', {
      id: response.data.id,
      po_number: response.data.po_number,
      po_created_date: response.data.po_created_date,
      po_delivery_date: response.data.po_delivery_date,
      po_expiry_date: response.data.po_expiry_date
    });

    // Wait for database updates
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify defaults were generated
    console.log('\n📋 DEFAULT DATE VERIFICATION:');

    const dbResults = await client.query(`
      SELECT id, po_number, po_created_date, po_delivery_date, po_expiry_date
      FROM dealshare_po_header
      WHERE po_number = 'DEFAULT_DATE_TEST_001'
    `);

    if (dbResults.rows.length > 0) {
      const record = dbResults.rows[0];
      console.log('✅ Found test record in database:');
      console.log(`   PO Number: ${record.po_number}`);
      console.log(`   Created Date: ${record.po_created_date}`);
      console.log(`   Delivery Date: ${record.po_delivery_date}`);
      console.log(`   Expiry Date: ${record.po_expiry_date}`);

      // Check if dates are reasonable defaults
      const createdDate = new Date(record.po_created_date);
      const deliveryDate = new Date(record.po_delivery_date);
      const expiryDate = new Date(record.po_expiry_date);

      const isCreatedRecent = Math.abs(createdDate.getTime() - startTime.getTime()) < 60000; // Within 1 minute
      const isDeliveryFuture = deliveryDate > createdDate;
      const isExpiryFuture = expiryDate > deliveryDate;

      console.log('\n🎯 DEFAULT DATE VALIDATION:');
      console.log(`   Created date is recent: ${isCreatedRecent ? '✅ YES' : '❌ NO'}`);
      console.log(`   Delivery date is future: ${isDeliveryFuture ? '✅ YES' : '❌ NO'}`);
      console.log(`   Expiry date is furthest future: ${isExpiryFuture ? '✅ YES' : '❌ NO'}`);

      if (isCreatedRecent && isDeliveryFuture && isExpiryFuture) {
        console.log('\n✅ SUCCESS: Default date generation works correctly!');
      } else {
        console.log('\n❌ FAILURE: Default dates are not reasonable');
      }

    } else {
      console.log('❌ Test data not found in database');
    }

  } catch (error) {
    console.error('❌ Default date test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  } finally {
    await client.end();
  }
}

testDefaultDates();