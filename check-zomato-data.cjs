const { Pool } = require('pg');

async function checkZomatoData() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking zomato_po_header:');
    const headersResult = await client.query(`
      SELECT id, po_number, po_date, total_items, grand_total, created_at
      FROM zomato_po_header
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    console.table(headersResult.rows);

    console.log('\n📋 Checking zomato_po_items:');
    const itemsResult = await client.query(`
      SELECT id, po_header_id, line_number, product_number, product_name, quantity_ordered, price_per_unit
      FROM zomato_po_items
      ORDER BY id DESC
      LIMIT 10;
    `);
    console.table(itemsResult.rows);

    console.log('\n📋 Checking po_master (should have Zomato data):');
    const poMasterResult = await client.query(`
      SELECT id, vendor_po_number, platform_id, series, po_date, create_on
      FROM po_master
      WHERE platform_id = 15 OR series = 'Zomato'
      ORDER BY create_on DESC
      LIMIT 5;
    `);
    console.table(poMasterResult.rows);

    console.log('\n📋 Checking po_lines (should have Zomato line items):');
    const poLinesResult = await client.query(`
      SELECT pl.id, pl.po_id, pl.platform_product_code_id, pl.quantity, pl.basic_amount, pm.vendor_po_number
      FROM po_lines pl
      JOIN po_master pm ON pm.id = pl.po_id
      WHERE pm.platform_id = 15 OR pm.series = 'Zomato'
      ORDER BY pl.id DESC
      LIMIT 10;
    `);
    console.table(poLinesResult.rows);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkZomatoData();
