const axios = require('axios');
const { Client } = require('pg');

async function finalVerificationTest() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔥 FINAL VERIFICATION: Testing API with corrected schema...');

    // First, clear any existing test data to get clean counts
    await client.connect();
    await client.query(`DELETE FROM dealshare_po_lines WHERE po_header_id IN (SELECT id FROM dealshare_po_header WHERE po_number LIKE '%FINAL%')`);
    await client.query(`DELETE FROM dealshare_po_header WHERE po_number LIKE '%FINAL%'`);

    const beforeHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const beforeLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 BEFORE - Headers: ${beforeHeader.rows[0].count}, Lines: ${beforeLines.rows[0].count}`);

    const testData = {
      header: {
        po_number: 'FINAL_VERIFICATION_001',
        uploaded_by: 'final_test',
        total_items: 3,
        total_quantity: '75',
        total_gross_amount: '6000.00',
        comments: 'Final test with corrected schema using dealshare_po_lines'
      },
      lines: [
        {
          line_number: 1,
          sku: 'FINAL_SKU_001',
          product_name: 'Final Product 1',
          quantity: 25,
          gross_amount: '2000.00'
        },
        {
          line_number: 2,
          sku: 'FINAL_SKU_002',
          product_name: 'Final Product 2',
          quantity: 25,
          gross_amount: '2000.00'
        },
        {
          line_number: 3,
          sku: 'FINAL_SKU_003',
          product_name: 'Final Product 3',
          quantity: 25,
          gross_amount: '2000.00'
        }
      ]
    };

    console.log('📤 Sending final API test to port 5005...');

    const response = await axios.post('http://127.0.0.1:5005/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000
    });

    console.log('✅ API Response:', response.data);
    const returnedId = response.data.id;

    // Wait for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check after insertion
    const afterHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const afterLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 AFTER - Headers: ${afterHeader.rows[0].count}, Lines: ${afterLines.rows[0].count}`);

    // Verify our specific test data
    const testHeader = await client.query(`
      SELECT id, po_number, uploaded_by, total_items, total_gross_amount, created_at
      FROM dealshare_po_header
      WHERE po_number = 'FINAL_VERIFICATION_001'
    `);

    if (testHeader.rows.length > 0) {
      const headerRecord = testHeader.rows[0];
      console.log('✅ SUCCESS: TEST DATA FOUND in dealshare_po_header:');
      console.log(`   ID: ${headerRecord.id}, PO: ${headerRecord.po_number}, Items: ${headerRecord.total_items}`);

      // Check for corresponding lines
      const testLines = await client.query(`
        SELECT po_header_id, line_number, sku, product_name, quantity, gross_amount
        FROM dealshare_po_lines
        WHERE po_header_id = $1
        ORDER BY line_number
      `, [headerRecord.id]);

      console.log(`✅ FOUND ${testLines.rows.length} lines in dealshare_po_lines:`);
      testLines.rows.forEach((line, index) => {
        console.log(`   Line ${line.line_number}: ${line.sku} (${line.product_name}), Qty: ${line.quantity}, Amount: ${line.gross_amount}`);
      });

      if (testLines.rows.length === parseInt(headerRecord.total_items)) {
        console.log('🎉🎉 PERFECT SUCCESS: Data correctly inserted into BOTH tables!');
        console.log('✅ dealshare_po_header: ✓');
        console.log('✅ dealshare_po_lines: ✓');
        console.log('✅ Correct number of lines: ✓');
        console.log('✅ API returns success: ✓');
        console.log('✅ Data actually persisted: ✓');
        console.log('');
        console.log('🎯 ISSUE COMPLETELY RESOLVED!');
        console.log('💡 The DealShare import API now works correctly and inserts data into the requested tables');
      } else {
        console.log(`⚠️  WARNING: Expected ${headerRecord.total_items} lines but found ${testLines.rows.length}`);
      }
    } else {
      console.log('❌ TEST DATA NOT FOUND - API may have failed silently');
    }

  } catch (error) {
    console.error('❌ Final verification test failed:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  } finally {
    await client.end();
  }
}

finalVerificationTest();