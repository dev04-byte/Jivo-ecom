const { Client } = require('pg');

async function directInsertTest() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Direct insert test into correct DealShare tables...');
    await client.connect();

    await client.query('BEGIN');

    // Insert into dealshare_po_header
    const headerResult = await client.query(`
      INSERT INTO dealshare_po_header (
        po_number, total_items, total_quantity, total_gross_amount, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id, po_number
    `, ['DIRECT_TEST_001', 2, '50.00', '3000.00', 'direct_test']);

    const headerId = headerResult.rows[0].id;
    console.log(`✅ Header inserted with ID: ${headerId}, PO: ${headerResult.rows[0].po_number}`);

    // Insert into dealshare_po_lines
    const line1Result = await client.query(`
      INSERT INTO dealshare_po_lines (
        po_header_id, line_number, sku, product_name, quantity, gross_amount
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [headerId, 1, 'DIRECT_SKU_001', 'Direct Test Product 1', 25, '1500.00']);

    const line2Result = await client.query(`
      INSERT INTO dealshare_po_lines (
        po_header_id, line_number, sku, product_name, quantity, gross_amount
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [headerId, 2, 'DIRECT_SKU_002', 'Direct Test Product 2', 25, '1500.00']);

    console.log(`✅ Line 1 inserted with ID: ${line1Result.rows[0].id}`);
    console.log(`✅ Line 2 inserted with ID: ${line2Result.rows[0].id}`);

    await client.query('COMMIT');

    console.log('');
    console.log('🎉 SUCCESS: Data directly inserted into correct tables!');
    console.log('📋 Tables used:');
    console.log('  ✓ dealshare_po_header - Header record created');
    console.log('  ✓ dealshare_po_lines - Line items created');

    // Verify the data
    console.log('');
    console.log('📋 Verification:');
    const verifyResult = await client.query(`
      SELECT h.id, h.po_number, h.total_items, h.total_quantity, h.total_gross_amount,
             COUNT(l.id) as line_count
      FROM dealshare_po_header h
      LEFT JOIN dealshare_po_lines l ON h.id = l.po_header_id
      WHERE h.id = $1
      GROUP BY h.id, h.po_number, h.total_items, h.total_quantity, h.total_gross_amount
    `, [headerId]);

    if (verifyResult.rows.length > 0) {
      const row = verifyResult.rows[0];
      console.log(`✅ Verified: PO ${row.po_number} with ${row.line_count} line items, Total: ${row.total_gross_amount}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Direct insert failed:', error.message);
  } finally {
    await client.end();
  }
}

directInsertTest();