const { Client } = require('pg');
const fs = require('fs');

async function createDealShareTables() {
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

    const sql = fs.readFileSync('create-dealshare-tables.sql', 'utf8');

    console.log('📝 Executing SQL to create DealShare tables...');
    await client.query(sql);

    console.log('✅ DealShare tables created successfully!');
    console.log('');
    console.log('Tables created:');
    console.log('- dealshare_po_header');
    console.log('- dealshare_po_items');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
}

createDealShareTables();