const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyDealShareTriggerFix() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔧 Applying DealShare trigger fix...');

    // Read the SQL fix file
    const sqlFix = fs.readFileSync(
      path.join(__dirname, 'fix-dealshare-trigger.sql'),
      'utf8'
    );

    // Execute the fix
    await pool.query(sqlFix);

    console.log('✅ DealShare trigger fix applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Try uploading your DealShare PO again');
    console.log('2. The trigger should now handle type conversions correctly');

  } catch (error) {
    console.error('❌ Error applying trigger fix:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
applyDealShareTriggerFix()
  .then(() => {
    console.log('\n✨ Fix completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  });
