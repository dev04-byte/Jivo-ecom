const { Pool } = require('pg');

async function checkAllTriggers() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking all PO-related triggers:');

    const triggersResult = await client.query(`
      SELECT
        c.relname as table_name,
        t.tgname as trigger_name,
        p.proname as function_name,
        CASE t.tgenabled
          WHEN 'O' THEN 'ENABLED'
          WHEN 'D' THEN 'DISABLED'
          ELSE 'OTHER'
        END as status
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE NOT t.tgisinternal
        AND c.relname LIKE '%_po_%'
      ORDER BY c.relname, t.tgname;
    `);

    console.table(triggersResult.rows);

    console.log('\n📊 Summary by table:');
    const tableGroups = {};
    triggersResult.rows.forEach(row => {
      if (!tableGroups[row.table_name]) {
        tableGroups[row.table_name] = [];
      }
      tableGroups[row.table_name].push(row.trigger_name);
    });

    Object.keys(tableGroups).sort().forEach(table => {
      console.log(`${table}: ${tableGroups[table].length} trigger(s)`);
    });

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkAllTriggers();
