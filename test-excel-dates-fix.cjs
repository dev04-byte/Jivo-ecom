const axios = require('axios');
const { Client } = require('pg');

async function testExcelDatesFix() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('📅 EXCEL DATE FIX TEST: Testing Excel-extracted dates are preserved');
    await client.connect();

    // Clean test data
    await client.query(`DELETE FROM dealshare_po_lines WHERE po_header_id IN (SELECT id FROM dealshare_po_header WHERE po_number LIKE '%EXCEL_DATE%')`);
    await client.query(`DELETE FROM dealshare_po_header WHERE po_number LIKE '%EXCEL_DATE%'`);

    const beforeCount = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    console.log(`📊 Before: ${beforeCount.rows[0].count} headers`);

    // Test with simulated Excel-extracted dates (Date objects)
    console.log('\n🧪 TEST: Excel-extracted dates should be preserved (not overridden with defaults)');

    // Simulate dates that would be extracted from Excel
    const excelCreatedDate = new Date('2025-01-10T08:30:00.000Z');
    const excelDeliveryDate = new Date('2025-01-25T16:00:00.000Z');
    const excelExpiryDate = new Date('2025-02-20T23:59:59.000Z');

    const testData = {
      header: {
        po_number: 'EXCEL_DATE_TEST_001',
        uploaded_by: 'excel_date_tester',
        total_items: 1,
        total_quantity: '75',
        total_gross_amount: '3750.00',
        comments: 'Testing Excel-extracted date preservation',
        // These would come from Excel parsing as Date objects
        po_created_date: excelCreatedDate,
        po_delivery_date: excelDeliveryDate,
        po_expiry_date: excelExpiryDate
      },
      lines: [{
        line_number: 1,
        sku: 'EXCEL_DATE_SKU_001',
        product_name: 'Excel Date Test Product',
        quantity: 75,
        gross_amount: '3750.00'
      }]
    };

    console.log('📤 Sending test with Excel-extracted dates (Date objects)...');
    console.log('   Expected po_created_date:', excelCreatedDate.toISOString());
    console.log('   Expected po_delivery_date:', excelDeliveryDate.toISOString());
    console.log('   Expected po_expiry_date:', excelExpiryDate.toISOString());

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // Verify dates are preserved in database
    console.log('\n📋 DATABASE VERIFICATION:');

    const dbResults = await client.query(`
      SELECT id, po_number, po_created_date, po_delivery_date, po_expiry_date, created_at
      FROM dealshare_po_header
      WHERE po_number = 'EXCEL_DATE_TEST_001'
    `);

    if (dbResults.rows.length > 0) {
      const record = dbResults.rows[0];
      console.log('✅ Found test record in database:');
      console.log(`   PO Number: ${record.po_number}`);
      console.log(`   Created Date: ${record.po_created_date}`);
      console.log(`   Delivery Date: ${record.po_delivery_date}`);
      console.log(`   Expiry Date: ${record.po_expiry_date}`);

      // Check if Excel dates were preserved correctly
      const createdMatch = new Date(record.po_created_date).toISOString() === excelCreatedDate.toISOString();
      const deliveryMatch = new Date(record.po_delivery_date).toISOString() === excelDeliveryDate.toISOString();
      const expiryMatch = new Date(record.po_expiry_date).toISOString() === excelExpiryDate.toISOString();

      console.log('\n🎯 EXCEL DATE PRESERVATION VALIDATION:');
      console.log(`   Created date preserved: ${createdMatch ? '✅ YES' : '❌ NO'}`);
      console.log(`   Delivery date preserved: ${deliveryMatch ? '✅ YES' : '❌ NO'}`);
      console.log(`   Expiry date preserved: ${expiryMatch ? '✅ YES' : '❌ NO'}`);

      if (createdMatch && deliveryMatch && expiryMatch) {
        console.log('\n🎉🎉🎉 SUCCESS! 🎉🎉🎉');
        console.log('✅ Excel-extracted dates are properly preserved!');
        console.log('✅ No more auto-generated dates overriding Excel data!');
        console.log('✅ User will now see correct dates in preview and database!');
        console.log('✅ Excel date extraction fix is COMPLETE!');
      } else {
        console.log('\n❌ FAILURE: Excel dates were not preserved correctly');
        console.log('Expected vs Actual:');
        if (!createdMatch) {
          console.log(`   Created - Expected: ${excelCreatedDate.toISOString()}, Got: ${new Date(record.po_created_date).toISOString()}`);
        }
        if (!deliveryMatch) {
          console.log(`   Delivery - Expected: ${excelDeliveryDate.toISOString()}, Got: ${new Date(record.po_delivery_date).toISOString()}`);
        }
        if (!expiryMatch) {
          console.log(`   Expiry - Expected: ${excelExpiryDate.toISOString()}, Got: ${new Date(record.po_expiry_date).toISOString()}`);
        }
      }

    } else {
      console.log('❌ Test data not found in database');
    }

  } catch (error) {
    console.error('❌ Excel date test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Server may not be ready yet on port 5009');
    }
  } finally {
    await client.end();
  }
}

testExcelDatesFix();