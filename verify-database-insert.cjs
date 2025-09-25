const { Client } = require('pg');

async function verifyDatabaseInsert() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Verifying data insertion into dealshare_po_header and dealshare_po_lines...');
    await client.connect();

    // Check dealshare_po_header table
    const headerResult = await client.query(`
      SELECT COUNT(*) as count FROM dealshare_po_header
    `);

    console.log(`📊 dealshare_po_header: ${headerResult.rows[0].count} records`);

    if (headerResult.rows[0].count > 0) {
      const latestHeader = await client.query(`
        SELECT po_number, uploaded_by, total_items, total_quantity, total_gross_amount, created_at
        FROM dealshare_po_header
        ORDER BY created_at DESC
        LIMIT 3
      `);

      console.log('📋 Latest dealshare_po_header records:');
      latestHeader.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. PO: ${row.po_number}, By: ${row.uploaded_by}, Items: ${row.total_items}, Amount: ${row.total_gross_amount}`);
      });
    }

    // Check dealshare_po_lines table
    const linesResult = await client.query(`
      SELECT COUNT(*) as count FROM dealshare_po_lines
    `);

    console.log(`📊 dealshare_po_lines: ${linesResult.rows[0].count} records`);

    if (linesResult.rows[0].count > 0) {
      const latestLines = await client.query(`
        SELECT po_header_id, line_number, sku, product_name, quantity, gross_amount, created_at
        FROM dealshare_po_lines
        ORDER BY created_at DESC
        LIMIT 6
      `);

      console.log('📋 Latest dealshare_po_lines records:');
      latestLines.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Header ID: ${row.po_header_id}, Line: ${row.line_number}, SKU: ${row.sku}, Qty: ${row.quantity}, Amount: ${row.gross_amount}`);
      });
    }

    // Verify if the latest API call data is there
    const recentTest = await client.query(`
      SELECT h.id, h.po_number, h.uploaded_by, h.total_items, COUNT(l.id) as line_count
      FROM dealshare_po_header h
      LEFT JOIN dealshare_po_lines l ON h.id = l.po_header_id
      WHERE h.po_number LIKE '%TEST%' OR h.po_number LIKE '%API%'
      GROUP BY h.id, h.po_number, h.uploaded_by, h.total_items
      ORDER BY h.created_at DESC
      LIMIT 5
    `);

    console.log('\n🧪 Recent test data verification:');
    if (recentTest.rows.length > 0) {
      recentTest.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, PO: ${row.po_number}, Lines: ${row.line_count}/${row.total_items}`);
        if (row.line_count !== parseInt(row.total_items)) {
          console.log(`    ⚠️  WARNING: Expected ${row.total_items} lines but found ${row.line_count}`);
        } else {
          console.log(`    ✅ Correct number of lines found`);
        }
      });
    } else {
      console.log('  ❌ No test data found');
    }

    console.log('\n🎯 DATABASE VERIFICATION COMPLETE');

  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
  } finally {
    await client.end();
  }
}

verifyDatabaseInsert();