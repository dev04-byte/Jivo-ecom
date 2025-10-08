const { Pool } = require('pg');

async function checkBlinkitTriggers() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking all triggers on blinkit tables:');

    const triggersResult = await client.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        proname as function_name,
        tgenabled as enabled
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE tgrelid IN (
        'blinkit_po_header'::regclass,
        'blinkit_po_lines'::regclass
      )
      AND NOT tgisinternal
      ORDER BY table_name, trigger_name;
    `);

    console.table(triggersResult.rows);

    if (triggersResult.rows.length > 0) {
      console.log('\n⚠️  Found active triggers! These need to be disabled.');
      console.log('Running disable commands...\n');

      for (const row of triggersResult.rows) {
        const dropCmd = `DROP TRIGGER IF EXISTS ${row.trigger_name} ON ${row.table_name};`;
        console.log(`Executing: ${dropCmd}`);
        await client.query(dropCmd);
      }

      console.log('\n✅ All Blinkit triggers have been disabled!');
    } else {
      console.log('\n✅ No active triggers found on Blinkit tables.');
    }

    // Also check data
    console.log('\n📋 Checking blinkit_po_header data:');
    const headerData = await client.query(`
      SELECT id, po_number, po_date, total_items, grand_total, created_at
      FROM blinkit_po_header
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    console.table(headerData.rows);

    console.log('\n📋 Checking blinkit_po_lines data:');
    const linesData = await client.query(`
      SELECT id, po_header_id, line_number, item_name, quantity, price_per_unit
      FROM blinkit_po_lines
      ORDER BY id DESC
      LIMIT 10;
    `);
    console.table(linesData.rows);

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkBlinkitTriggers();
