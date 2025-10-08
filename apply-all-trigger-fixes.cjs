const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function applyAllTriggerFixes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();

    // Fix BigBasket trigger
    console.log('\n📝 Fixing BigBasket trigger...');
    const bigbasketSql = fs.readFileSync('./fix-bigbasket-trigger-complete.sql', 'utf8');
    await client.query(bigbasketSql);
    console.log('✅ BigBasket trigger fixed!');

    // Fix Swiggy trigger
    console.log('\n📝 Fixing Swiggy trigger...');
    const swiggySql = fs.readFileSync('./fix-swiggy-trigger.sql', 'utf8');
    await client.query(swiggySql);
    console.log('✅ Swiggy trigger fixed!');

    console.log('\n🎉 All triggers fixed successfully!\n');
    console.log('📋 Key fixes applied:');
    console.log('   ✅ Added po_id column (gets value from po_master)');
    console.log('   ✅ Fixed pf_id comparison (VARCHAR, not INTEGER)');
    console.log('   ✅ Added TRIM() to sap_id for CHAR padding');
    console.log('   ✅ All numeric fields properly cast');
    console.log('   ✅ All text fields properly cast');
    console.log('\n🎯 Ready to import POs!\n');

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying trigger fixes:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

applyAllTriggerFixes();
