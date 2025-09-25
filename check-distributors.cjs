const { Client } = require('pg');

async function checkDistributors() {
  const client = new Client({
    host: '103.89.44.240',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'ecom',
    ssl: false
  });

  try {
    console.log('🔍 Checking distributors table state...');
    await client.connect();

    // Check if distributors table exists and its contents
    const distributorExists = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_name = 'distributors'
    `);

    console.log(`Table 'distributors' exists: ${distributorExists.rows[0].count > 0}`);

    if (distributorExists.rows[0].count > 0) {
      const distributorData = await client.query('SELECT id, distributor_name, status FROM distributors');
      console.log(`📊 distributors table contents (${distributorData.rows.length} records):`);
      distributorData.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Name: ${row.distributor_name}, Status: ${row.status}`);
      });

      // Check if ID 1 specifically exists
      const id1Check = await client.query('SELECT COUNT(*) as count FROM distributors WHERE id = 1');
      console.log(`ID=1 exists in distributors: ${id1Check.rows[0].count > 0}`);
    } else {
      console.log('❌ distributors table does not exist!');
    }

    // Also check distributor_mst for comparison
    const distributorMstExists = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables
      WHERE table_name = 'distributor_mst'
    `);

    if (distributorMstExists.rows[0].count > 0) {
      const distributorMstData = await client.query('SELECT id, distributor_name, status FROM distributor_mst LIMIT 3');
      console.log(`📊 distributor_mst table contents (${distributorMstData.rows.length} records):`);
      distributorMstData.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Name: ${row.distributor_name}, Status: ${row.status}`);
      });
    }

    // Let's directly insert ID=1 into distributors to ensure it exists
    try {
      await client.query(`
        INSERT INTO distributors (id, distributor_name, distributor_code, status)
        VALUES (1, 'System Default Distributor', 'SYS_DEFAULT', 'Active')
        ON CONFLICT (id) DO UPDATE SET
          distributor_name = EXCLUDED.distributor_name,
          status = EXCLUDED.status
      `);
      console.log('✅ Ensured ID=1 exists in distributors table');
    } catch (insertError) {
      console.log('⚠️ Error ensuring ID=1:', insertError.message);
    }

    // Final verification
    const finalCheck = await client.query('SELECT COUNT(*) as count FROM distributors WHERE id = 1');
    console.log(`🎯 Final verification - ID=1 exists: ${finalCheck.rows[0].count > 0}`);

  } catch (error) {
    console.error('❌ Error checking distributors:', error.message);
  } finally {
    await client.end();
  }
}

checkDistributors();