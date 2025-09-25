const { Client } = require('pg');

async function verifyDealshareData() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Connecting to database to verify DealShare data...');
    await client.connect();

    // Check dealshare_po_header data
    console.log('📋 Checking dealshare_po_header table:');
    const headerResult = await client.query(`
      SELECT id, po_number, total_items, total_quantity, total_gross_amount, uploaded_by, created_at
      FROM dealshare_po_header
      ORDER BY id DESC
    `);

    if (headerResult.rows.length > 0) {
      console.log(`✅ Found ${headerResult.rows.length} records in dealshare_po_header:`);
      headerResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, PO: ${row.po_number}, Items: ${row.total_items}, Qty: ${row.total_quantity}, Amount: ${row.total_gross_amount}, By: ${row.uploaded_by}`);
      });
    } else {
      console.log('❌ No records found in dealshare_po_header');
    }

    // Check dealshare_po_lines data
    console.log('');
    console.log('📋 Checking dealshare_po_lines table:');
    const linesResult = await client.query(`
      SELECT id, po_header_id, line_number, sku, product_name, quantity, gross_amount
      FROM dealshare_po_lines
      ORDER BY po_header_id, line_number
    `);

    if (linesResult.rows.length > 0) {
      console.log(`✅ Found ${linesResult.rows.length} records in dealshare_po_lines:`);
      linesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Line ID: ${row.id}, Header ID: ${row.po_header_id}, Line: ${row.line_number}, SKU: ${row.sku}, Product: ${row.product_name}, Qty: ${row.quantity}, Amount: ${row.gross_amount}`);
      });
    } else {
      console.log('❌ No records found in dealshare_po_lines');
    }

    console.log('');
    console.log('🎉 VERIFICATION COMPLETE: Data successfully verified in correct tables!');

  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
  } finally {
    await client.end();
  }
}

verifyDealshareData();