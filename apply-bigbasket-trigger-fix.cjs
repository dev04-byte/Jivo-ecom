const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function fixBigBasketTrigger() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    console.log('🔄 Reading SQL file...');
    const sql = fs.readFileSync('./fix-bigbasket-trigger-complete.sql', 'utf8');

    console.log('🔄 Executing BigBasket trigger fix...');
    console.log('📝 Applying type conversions to match po_lines schema\n');

    await client.query(sql);

    console.log('✅ BigBasket trigger fixed successfully!\n');
    console.log('📋 The trigger now properly handles type conversions:');
    console.log('   - Casts sku_code and pf_itemcode to TEXT for comparison');
    console.log('   - Casts quantity to NUMERIC(12,2)');
    console.log('   - Casts basic_cost to NUMERIC(14,2)');
    console.log('   - Casts all items table fields to proper types');
    console.log('   - Handles NULL values with CASE statements');
    console.log('\n🎯 BigBasket PO imports should now work correctly!\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing BigBasket trigger:', error.message);
    console.error('\n💡 Error details:', error);
    await pool.end();
    process.exit(1);
  }
}

fixBigBasketTrigger();
