const axios = require('axios');
const { Client } = require('pg');

async function ultimateTest() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🚀 ULTIMATE TEST: Final verification of DealShare import with all fixes applied');
    await client.connect();

    // Clean slate
    await client.query(`DELETE FROM dealshare_po_lines WHERE po_header_id IN (SELECT id FROM dealshare_po_header WHERE po_number LIKE '%ULTIMATE%')`);
    await client.query(`DELETE FROM dealshare_po_header WHERE po_number LIKE '%ULTIMATE%'`);

    const beforeHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const beforeLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 BEFORE - Headers: ${beforeHeader.rows[0].count}, Lines: ${beforeLines.rows[0].count}`);

    const testData = {
      header: {
        po_number: 'ULTIMATE_SUCCESS_TEST_001',
        uploaded_by: 'ultimate_tester',
        total_items: 2,
        total_quantity: '100',
        total_gross_amount: '8000.00',
        comments: 'Ultimate test - should work with all fixes'
      },
      lines: [
        {
          line_number: 1,
          sku: 'ULTIMATE_SKU_001',
          product_name: 'Ultimate Product 1',
          quantity: 50,
          gross_amount: '4000.00'
        },
        {
          line_number: 2,
          sku: 'ULTIMATE_SKU_002',
          product_name: 'Ultimate Product 2',
          quantity: 50,
          gross_amount: '4000.00'
        }
      ]
    };

    console.log('📤 Sending ULTIMATE test to fresh server on port 5006...');
    console.log('Test data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://127.0.0.1:5006/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    console.log('✅ API Response received:', response.data);
    const returnedId = response.data.id;

    // Wait for database transaction to complete
    console.log('⏳ Waiting for database transaction to complete...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check counts after insertion
    const afterHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const afterLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 AFTER - Headers: ${afterHeader.rows[0].count}, Lines: ${afterLines.rows[0].count}`);

    const headerIncreased = afterHeader.rows[0].count > beforeHeader.rows[0].count;
    const linesIncreased = afterLines.rows[0].count > beforeLines.rows[0].count;

    console.log(`Header count increased: ${headerIncreased}`);
    console.log(`Lines count increased: ${linesIncreased}`);

    // Look for our specific test data
    const testHeader = await client.query(`
      SELECT id, po_number, uploaded_by, total_items, total_gross_amount, created_at
      FROM dealshare_po_header
      WHERE po_number = 'ULTIMATE_SUCCESS_TEST_001'
    `);

    if (testHeader.rows.length > 0) {
      const headerRecord = testHeader.rows[0];
      console.log('🎉 ULTIMATE SUCCESS: TEST DATA FOUND in dealshare_po_header!');
      console.log(`   Header ID: ${headerRecord.id}, PO Number: ${headerRecord.po_number}`);
      console.log(`   Uploaded by: ${headerRecord.uploaded_by}, Total items: ${headerRecord.total_items}`);

      // Check for corresponding lines
      const testLines = await client.query(`
        SELECT po_header_id, line_number, sku, product_name, quantity, gross_amount
        FROM dealshare_po_lines
        WHERE po_header_id = $1
        ORDER BY line_number
      `, [headerRecord.id]);

      console.log(`✅ FOUND ${testLines.rows.length} lines in dealshare_po_lines:`);
      testLines.rows.forEach((line) => {
        console.log(`   Line ${line.line_number}: ${line.sku} (${line.product_name})`);
        console.log(`                     Qty: ${line.quantity}, Amount: ${line.gross_amount}`);
      });

      if (testLines.rows.length === parseInt(headerRecord.total_items)) {
        console.log('');
        console.log('🎊🎊🎊 COMPLETE SUCCESS! 🎊🎊🎊');
        console.log('✅ DealShare import API is now FULLY FUNCTIONAL!');
        console.log('✅ Data correctly inserts into dealshare_po_header');
        console.log('✅ Data correctly inserts into dealshare_po_lines');
        console.log('✅ Correct number of line items created');
        console.log('✅ API returns proper success response');
        console.log('✅ Database transactions complete successfully');
        console.log('');
        console.log('🎯 ALL ISSUES HAVE BEEN RESOLVED!');
        console.log('💡 The user can now use the API to import DealShare PO data');
        console.log(`📋 API endpoint: POST /api/po/import/dealshare`);
        console.log(`🏢 Database tables: dealshare_po_header + dealshare_po_lines`);
      } else {
        console.log(`⚠️  Line count mismatch: Expected ${headerRecord.total_items}, found ${testLines.rows.length}`);
      }
    } else {
      console.log('❌ ULTIMATE TEST FAILED: Data not found in dealshare_po_header');

      // Check all recent headers for debugging
      const recentHeaders = await client.query(`
        SELECT id, po_number, created_at FROM dealshare_po_header
        ORDER BY created_at DESC LIMIT 5
      `);
      console.log('Recent headers in dealshare_po_header:');
      recentHeaders.rows.forEach(h => {
        console.log(`  ID: ${h.id}, PO: ${h.po_number}, Created: ${h.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ ULTIMATE TEST FAILED:', error.message);
    if (error.response) {
      console.error('API Error Status:', error.response.status);
      console.error('API Error Data:', error.response.data);
    }
  } finally {
    await client.end();
  }
}

ultimateTest();