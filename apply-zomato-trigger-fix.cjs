const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyZomatoTriggerFix() {
  // Load DATABASE_URL from .env file
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('📖 Reading Zomato trigger SQL file...');
    const sqlFile = path.join(__dirname, 'fix-zomato-trigger.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🚀 Applying Zomato trigger fix...');
    await client.query(sql);

    console.log('✅ Zomato trigger fix applied successfully!');
    console.log('');
    console.log('📋 Triggers created:');
    console.log('  - trg_zomato_po_header_after_insert (on zomato_po_header)');
    console.log('  - trg_zomato_po_items_after_insert (on zomato_po_items)');
    console.log('');
    console.log('🎯 What was fixed:');
    console.log('  - Zomato platform added to platforms table');
    console.log('  - Trigger syncs zomato_po_header → po_master');
    console.log('  - Trigger syncs zomato_po_items → po_lines');
    console.log('  - Platform ID is dynamically fetched from platforms table');

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error applying Zomato trigger fix:', error);
    await pool.end();
    process.exit(1);
  }
}

applyZomatoTriggerFix();
