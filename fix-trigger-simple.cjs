const { Pool } = require('pg');
const fs = require('fs');

async function fixTrigger() {
  require('dotenv').config();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🔄 Reading SQL file...');
    const sql = fs.readFileSync('./fix-swiggy-trigger.sql', 'utf8');

    console.log('🔄 Executing trigger fix...');
    console.log('📝 SQL to execute:\n', sql.substring(0, 500) + '...\n');

    await client.query(sql);

    console.log('✅ Swiggy trigger fixed successfully!');
    console.log('\n📋 The trigger now properly handles type conversions');
    console.log('   - Casts item_code and pf_itemcode to TEXT for comparison');
    console.log('   - Now your Swiggy PO uploads should work!\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing trigger:', error.message);
    console.error('\n💡 Alternative: Run this SQL directly in your database:');
    console.error('   psql $DATABASE_URL -f fix-swiggy-trigger.sql\n');
    await pool.end();
    process.exit(1);
  }
}

fixTrigger();
