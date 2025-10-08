const { Pool } = require('pg');

async function insertZomatoPlatform() {
  // Load DATABASE_URL from .env file
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    // Check current platforms
    console.log('📋 Current platforms in database:');
    const platformsResult = await client.query('SELECT id, name FROM platforms ORDER BY id');
    console.table(platformsResult.rows);

    // Insert Zomato if it doesn't exist
    console.log('\n🔄 Inserting Zomato platform...');
    const insertResult = await client.query(`
      INSERT INTO platforms (name)
      VALUES ('Zomato')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `);

    console.log('✅ Zomato platform:', insertResult.rows[0]);

    // Also insert into pf_mst for backward compatibility
    console.log('\n🔄 Inserting Zomato into pf_mst...');
    const pfMstResult = await client.query(`
      INSERT INTO pf_mst (pf_name)
      VALUES ('Zomato')
      ON CONFLICT (pf_name) DO UPDATE SET pf_name = EXCLUDED.pf_name
      RETURNING id, pf_name
    `);

    console.log('✅ Zomato in pf_mst:', pfMstResult.rows[0]);

    // Show final platforms table
    console.log('\n📋 Updated platforms table:');
    const updatedPlatforms = await client.query('SELECT id, name FROM platforms ORDER BY id');
    console.table(updatedPlatforms.rows);

    client.release();
    await pool.end();

    console.log('\n✅ All done! You can now import Zomato POs.');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

insertZomatoPlatform();
