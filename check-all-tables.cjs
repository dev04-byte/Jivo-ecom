const { Client } = require('pg');

async function checkAllDealshareData() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Checking all DealShare related tables...');
    await client.connect();

    // List all tables with dealshare in the name
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%dealshare%'
      ORDER BY table_name
    `);

    console.log('📋 Found the following DealShare tables:');
    for (const table of tablesResult.rows) {
      console.log(`  ✓ ${table.table_name}`);

      // Count records in each table
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        console.log(`    Records: ${countResult.rows[0].count}`);

        // Show sample data if any exists
        if (countResult.rows[0].count > 0) {
          const sampleResult = await client.query(`SELECT * FROM ${table.table_name} LIMIT 3`);
          console.log('    Sample data:');
          sampleResult.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}. ${JSON.stringify(row)}`);
          });
        }
      } catch (error) {
        console.log(`    Error querying ${table.table_name}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await client.end();
  }
}

checkAllDealshareData();