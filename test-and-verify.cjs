const axios = require('axios');
const { Client } = require('pg');

async function testAndVerify() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🧪 Testing API and immediately verifying database insertion...');

    // First, check current record counts
    await client.connect();
    const beforeHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const beforeLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 BEFORE - Headers: ${beforeHeader.rows[0].count}, Lines: ${beforeLines.rows[0].count}`);

    const testData = {
      header: {
        po_number: 'VERIFY_TEST_001',
        uploaded_by: 'verify_test',
        total_items: 2,
        total_quantity: '50',
        total_gross_amount: '4000.00',
        comments: 'Test to verify immediate insertion'
      },
      lines: [
        {
          line_number: 1,
          sku: 'VERIFY_SKU_001',
          product_name: 'Verify Test Product 1',
          quantity: 25,
          gross_amount: '2000.00'
        },
        {
          line_number: 2,
          sku: 'VERIFY_SKU_002',
          product_name: 'Verify Test Product 2',
          quantity: 25,
          gross_amount: '2000.00'
        }
      ]
    };

    console.log('📤 Sending API test...');

    const response = await axios.post('http://127.0.0.1:5001/api/po/import/dealshare', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000
    });

    console.log('✅ API Response:', response.data);

    // Wait a moment for database transaction to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check after insertion
    const afterHeader = await client.query('SELECT COUNT(*) as count FROM dealshare_po_header');
    const afterLines = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');
    console.log(`📊 AFTER - Headers: ${afterHeader.rows[0].count}, Lines: ${afterLines.rows[0].count}`);

    // Check if our specific test data is there
    const testHeader = await client.query(`
      SELECT id, po_number, uploaded_by, total_items, total_gross_amount, created_at
      FROM dealshare_po_header
      WHERE po_number = 'VERIFY_TEST_001'
    `);

    if (testHeader.rows.length > 0) {
      console.log('✅ TEST DATA FOUND in dealshare_po_header:');
      console.log(`   ID: ${testHeader.rows[0].id}, PO: ${testHeader.rows[0].po_number}`);

      // Check for corresponding lines
      const testLines = await client.query(`
        SELECT po_header_id, line_number, sku, product_name, quantity, gross_amount
        FROM dealshare_po_lines
        WHERE po_header_id = $1
      `, [testHeader.rows[0].id]);

      console.log(`✅ FOUND ${testLines.rows.length} lines in dealshare_po_lines:`);
      testLines.rows.forEach((line, index) => {
        console.log(`   Line ${index + 1}: ${line.sku}, Qty: ${line.quantity}, Amount: ${line.gross_amount}`);
      });

      if (testLines.rows.length === 2) {
        console.log('🎉 SUCCESS: Data correctly inserted into both tables!');
      } else {
        console.log('⚠️  WARNING: Header found but line count mismatch');
      }
    } else {
      console.log('❌ TEST DATA NOT FOUND in dealshare_po_header');

      // Check if it went to a different table
      console.log('🔍 Checking if data went to dealshare_po_items instead...');
      const itemsCheck = await client.query(`
        SELECT COUNT(*) as count FROM information_schema.tables
        WHERE table_name = 'dealshare_po_items'
      `);

      if (itemsCheck.rows[0].count > 0) {
        const itemsData = await client.query(`
          SELECT COUNT(*) as count FROM dealshare_po_items
        `);
        console.log(`📊 dealshare_po_items has ${itemsData.rows[0].count} records`);
      } else {
        console.log('ℹ️  dealshare_po_items table does not exist');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  } finally {
    await client.end();
  }
}

testAndVerify();