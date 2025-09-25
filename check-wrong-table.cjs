const { Client } = require('pg');

async function checkWrongTable() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Checking if data went to wrong table (dealshare_po_items)...');
    await client.connect();

    // Check dealshare_po_items table (wrong table)
    try {
      const itemsResult = await client.query(`
        SELECT COUNT(*) as count FROM dealshare_po_items
      `);
      console.log(`📋 dealshare_po_items table has ${itemsResult.rows[0].count} records`);

      if (itemsResult.rows[0].count > 0) {
        const sampleResult = await client.query(`
          SELECT id, po_header_id, line_number, sku, product_name, quantity, gross_amount
          FROM dealshare_po_items
          ORDER BY id DESC
          LIMIT 5
        `);

        console.log('✅ Found data in WRONG table (dealshare_po_items):');
        sampleResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. Line ID: ${row.id}, Header ID: ${row.po_header_id}, Line: ${row.line_number}`);
          console.log(`      SKU: ${row.sku}, Product: ${row.product_name}, Qty: ${row.quantity}, Amount: ${row.gross_amount}`);
        });

        console.log('');
        console.log('🔥 ISSUE CONFIRMED: API is still inserting into dealshare_po_items (old table)');
        console.log('💡 SOLUTION: Server needs restart to load corrected schema pointing to dealshare_po_lines');
      }
    } catch (error) {
      console.log('❌ dealshare_po_items table does not exist (which is correct)');
    }

    // Check all headers regardless
    const allHeadersResult = await client.query(`
      SELECT id, po_number, total_items, total_quantity, total_gross_amount, uploaded_by, created_at
      FROM dealshare_po_header
      ORDER BY id DESC
    `);

    console.log('');
    console.log(`📋 All records in dealshare_po_header (${allHeadersResult.rows.length} total):`);
    allHeadersResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, PO: ${row.po_number}, Items: ${row.total_items}, By: ${row.uploaded_by}`);
    });

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await client.end();
  }
}

checkWrongTable();