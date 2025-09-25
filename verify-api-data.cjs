const { Client } = require('pg');

async function verifyAPIData() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Verifying API-imported DealShare data...');
    await client.connect();

    // Check for the API test data specifically
    const headerResult = await client.query(`
      SELECT id, po_number, total_items, total_quantity, total_gross_amount, uploaded_by, comments, created_at
      FROM dealshare_po_header
      WHERE po_number LIKE 'API_%' OR uploaded_by LIKE '%api%'
      ORDER BY id DESC
    `);

    if (headerResult.rows.length > 0) {
      console.log(`✅ Found ${headerResult.rows.length} API-imported records in dealshare_po_header:`);
      headerResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, PO: ${row.po_number}, Items: ${row.total_items}, Qty: ${row.total_quantity}, Amount: ${row.total_gross_amount}`);
        console.log(`      By: ${row.uploaded_by}, Comments: ${row.comments}`);
        console.log(`      Created: ${row.created_at}`);
      });

      // Get line items for these headers
      const headerIds = headerResult.rows.map(row => row.id);
      if (headerIds.length > 0) {
        const linesResult = await client.query(`
          SELECT id, po_header_id, line_number, sku, product_name, quantity, gross_amount
          FROM dealshare_po_lines
          WHERE po_header_id = ANY($1)
          ORDER BY po_header_id, line_number
        `, [headerIds]);

        console.log('');
        console.log(`✅ Found ${linesResult.rows.length} associated line items in dealshare_po_lines:`);
        linesResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. Line ID: ${row.id}, Header ID: ${row.po_header_id}, Line: ${row.line_number}`);
          console.log(`      SKU: ${row.sku}, Product: ${row.product_name}`);
          console.log(`      Qty: ${row.quantity}, Amount: ${row.gross_amount}`);
        });
      }
    } else {
      console.log('❌ No API-imported records found');
    }

    console.log('');
    console.log('🎉 API IMPORT VERIFICATION COMPLETE!');

  } catch (error) {
    console.error('❌ Error verifying API data:', error.message);
  } finally {
    await client.end();
  }
}

verifyAPIData();