const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function applyDealShareMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🔄 Reading migration SQL file...');
    const sql = fs.readFileSync('./add-dealshare-tax-total-columns.sql', 'utf8');

    console.log('🔄 Applying Dealshare migration...');
    console.log('📝 Adding tax_amount and total_value columns to dealshare_po_lines\n');

    await client.query(sql);

    console.log('✅ Dealshare migration completed successfully!\n');
    console.log('📋 Added columns:');
    console.log('   - tax_amount: numeric(12,2) - Calculated from (buying_price * qty * tax%)');
    console.log('   - total_value: numeric(12,2) - gross_amount + tax_amount');
    console.log('\n🎯 Dealshare PO imports will now show correct tax and total amounts!\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

applyDealShareMigration();
