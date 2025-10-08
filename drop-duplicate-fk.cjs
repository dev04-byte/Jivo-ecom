const { Pool } = require('pg');

async function dropDuplicateForeignKey() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('\n📋 Checking foreign key constraints on po_master:');
    const fksResult = await client.query(`
      SELECT
        conname as constraint_name,
        conrelid::regclass as table_name,
        confrelid::regclass as foreign_table,
        a.attname as column_name
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE conrelid = 'po_master'::regclass
        AND contype = 'f'
      ORDER BY conname;
    `);
    console.table(fksResult.rows);

    console.log('\n⚠️  Found duplicate foreign key constraint on platform_id!');
    console.log('The po_master table has TWO foreign keys:');
    console.log('  1. po_master_platform_id_fkey → platforms table ✅ (correct)');
    console.log('  2. po_master_platform_id_pf_mst_id_fk → pf_mst table ❌ (duplicate/legacy)');
    console.log('');
    console.log('🔄 Dropping the duplicate constraint to pf_mst...');

    await client.query(`
      ALTER TABLE po_master
      DROP CONSTRAINT IF EXISTS po_master_platform_id_pf_mst_id_fk;
    `);

    console.log('✅ Successfully dropped duplicate foreign key constraint!');
    console.log('');
    console.log('📋 Remaining foreign keys on po_master:');
    const updatedFksResult = await client.query(`
      SELECT
        conname as constraint_name,
        conrelid::regclass as table_name,
        confrelid::regclass as foreign_table,
        a.attname as column_name
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE conrelid = 'po_master'::regclass
        AND contype = 'f'
      ORDER BY conname;
    `);
    console.table(updatedFksResult.rows);

    client.release();
    await pool.end();

    console.log('\n✅ Done! Now you can import Zomato POs.');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

dropDuplicateForeignKey();
