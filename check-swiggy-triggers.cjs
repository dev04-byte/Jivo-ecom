const { Pool } = require('pg');

async function checkSwiggyTriggers() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking all triggers on swiggy tables:');

    const triggersResult = await client.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        proname as function_name,
        tgenabled as enabled
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE tgrelid IN (
        'swiggy_pos'::regclass,
        'swiggy_po_lines'::regclass
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

      console.log('\n✅ All Swiggy triggers have been disabled!');
    } else {
      console.log('\n✅ No active triggers found on Swiggy tables.');
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkSwiggyTriggers();
