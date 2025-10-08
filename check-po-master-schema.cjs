const { Client } = require('pg');
require('dotenv').config();

async function checkPoMasterSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    console.log('🔍 Checking po_master table schema...\n');

    // Get all columns in po_master table
    const result = await client.query(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'po_master'
      ORDER BY ordinal_position;
    `);

    console.log('📋 po_master table columns:');
    console.table(result.rows);

    // Check if company or company_id exists
    const hasCompany = result.rows.some(row => row.column_name === 'company');
    const hasCompanyId = result.rows.some(row => row.column_name === 'company_id');

    console.log('\n🔍 Analysis:');
    console.log(`- Has 'company' column: ${hasCompany ? '✅ YES' : '❌ NO'}`);
    console.log(`- Has 'company_id' column: ${hasCompanyId ? '✅ YES' : '❌ NO'}`);

    if (!hasCompany && !hasCompanyId) {
      console.log('\n⚠️ Neither company nor company_id exists in po_master table');
      console.log('💡 Solution: Remove company/company_id from insertIntoPoMasterAndLines function');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPoMasterSchema();
