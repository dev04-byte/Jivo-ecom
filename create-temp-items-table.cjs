const { Client } = require('pg');

async function createTempItemsTable() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔧 Creating temporary dealshare_po_items table to make current server work...');
    await client.connect();

    // Create dealshare_po_items table identical to dealshare_po_lines
    await client.query(`
      CREATE TABLE IF NOT EXISTS dealshare_po_items (
        id SERIAL PRIMARY KEY,
        po_header_id INTEGER NOT NULL REFERENCES dealshare_po_header(id) ON DELETE CASCADE,
        line_number INTEGER NOT NULL,
        sku VARCHAR(100),
        product_name TEXT,
        hsn_code VARCHAR(20),
        quantity INTEGER,
        mrp_tax_inclusive DECIMAL(10, 2),
        buying_price DECIMAL(10, 2),
        gst_percent DECIMAL(5, 2),
        cess_percent DECIMAL(5, 2),
        gross_amount DECIMAL(12, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Temporary dealshare_po_items table created');

    // Also copy existing data from dealshare_po_lines to dealshare_po_items
    await client.query(`
      INSERT INTO dealshare_po_items (
        po_header_id, line_number, sku, product_name, hsn_code, quantity,
        mrp_tax_inclusive, buying_price, gst_percent, cess_percent, gross_amount
      )
      SELECT
        po_header_id, line_number, sku, product_name, hsn_code, quantity,
        mrp_tax_inclusive, buying_price, gst_percent, cess_percent, gross_amount
      FROM dealshare_po_lines
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Existing data copied from dealshare_po_lines to dealshare_po_items');

    // Verify the setup
    const itemsCount = await client.query('SELECT COUNT(*) as count FROM dealshare_po_items');
    const linesCount = await client.query('SELECT COUNT(*) as count FROM dealshare_po_lines');

    console.log(`📊 dealshare_po_items: ${itemsCount.rows[0].count} records`);
    console.log(`📊 dealshare_po_lines: ${linesCount.rows[0].count} records`);

    console.log('');
    console.log('🎯 TEMPORARY SOLUTION: Current server can now work with dealshare_po_items');
    console.log('💡 NEXT STEP: Test API import, then fix schema to use dealshare_po_lines');

  } catch (error) {
    console.error('❌ Error creating temporary table:', error.message);
  } finally {
    await client.end();
  }
}

createTempItemsTable();