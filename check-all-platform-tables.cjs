const { Pool } = require('pg');

async function checkPlatformTables() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Finding all platform PO tables:');

    // Get all tables that might be platform-specific PO tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND (
          table_name LIKE '%_po_header'
          OR table_name LIKE '%_po_lines'
        )
      ORDER BY table_name;
    `);

    console.table(tablesResult.rows);

    console.log('\n🔍 Checking which tables have triggers:');

    const triggersResult = await client.query(`
      SELECT DISTINCT c.relname as table_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      WHERE NOT t.tgisinternal
        AND (c.relname LIKE '%_po_header' OR c.relname LIKE '%_po_lines')
      ORDER BY c.relname;
    `);

    const tablesWithTriggers = new Set(triggersResult.rows.map(r => r.table_name));
    const allTables = tablesResult.rows.map(r => r.table_name);

    console.log('\n✅ Tables WITH triggers:');
    allTables.forEach(table => {
      if (tablesWithTriggers.has(table)) {
        console.log(`  ✓ ${table}`);
      }
    });

    console.log('\n❌ Tables WITHOUT triggers (NEED FIXING):');
    allTables.forEach(table => {
      if (!tablesWithTriggers.has(table)) {
        console.log(`  ✗ ${table}`);
      }
    });

    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkPlatformTables();
