const { Client } = require('pg');

async function createMissingTables() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔧 Creating missing tables that are causing transaction failures...');
    await client.connect();

    // Create distributor_mst table (this was causing the main error)
    await client.query(`
      CREATE TABLE IF NOT EXISTS distributor_mst (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default distributor
    await client.query(`
      INSERT INTO distributor_mst (id, name, code)
      VALUES (1, 'Default Distributor', 'DEFAULT')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Created distributor_mst table with default distributor');

    // Also create any other missing tables that might be referenced
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default company
    await client.query(`
      INSERT INTO companies (id, name, code)
      VALUES (1, 'Default Company', 'DEFAULT')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Created companies table with default company');

    // Verify the tables
    const distributorCount = await client.query('SELECT COUNT(*) as count FROM distributor_mst');
    const companiesCount = await client.query('SELECT COUNT(*) as count FROM companies');

    console.log(`📊 distributor_mst: ${distributorCount.rows[0].count} records`);
    console.log(`📊 companies: ${companiesCount.rows[0].count} records`);

    console.log('');
    console.log('🎯 ISSUE FIXED: Missing tables created');
    console.log('💡 API should now successfully insert data into database');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
}

createMissingTables();