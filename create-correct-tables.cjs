const { Client } = require('pg');
const fs = require('fs');

async function createCorrectDealShareTables() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();

    const sql = fs.readFileSync('create-correct-dealshare-tables.sql', 'utf8');

    console.log('📝 Creating correct DealShare tables (dealshare_po_lines)...');
    await client.query(sql);

    console.log('✅ Correct DealShare tables created successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('- dealshare_po_header');
    console.log('- dealshare_po_lines (corrected from dealshare_po_items)');

    // Verify the tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'dealshare_po_%'
      ORDER BY table_name
    `);

    console.log('');
    console.log('📋 Verified tables in database:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
}

createCorrectDealShareTables();