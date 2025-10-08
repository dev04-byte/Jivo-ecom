const { Pool } = require('pg');

async function disableZomatoTrigger() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🔄 Disabling Zomato triggers...');

    // Disable both triggers
    await client.query(`
      DROP TRIGGER IF EXISTS trg_zomato_po_header_after_insert ON zomato_po_header;
      DROP TRIGGER IF EXISTS trg_zomato_po_items_after_insert ON zomato_po_items;
    `);

    console.log('✅ Zomato triggers disabled successfully!');
    console.log('');
    console.log('📋 You can now test the import without triggers.');
    console.log('Note: This means data will NOT be automatically synced to po_master/po_lines');
    console.log('The insertIntoPoMasterAndLines function in storage.ts will handle it instead.');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

disableZomatoTrigger();
