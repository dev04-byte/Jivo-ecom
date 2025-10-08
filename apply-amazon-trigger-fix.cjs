const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyAmazonTriggerFix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔧 Connecting to database...');
    await client.connect();

    console.log('🔧 Applying Amazon trigger fix...');

    // Read the SQL fix file
    const sqlFix = fs.readFileSync(
      path.join(__dirname, 'fix-amazon-triggers.sql'),
      'utf8'
    );

    // Execute the fix
    const result = await client.query(sqlFix);

    console.log('✅ Amazon triggers fixed successfully!');
    console.log('\n📋 Verification result:');
    if (result.rows && result.rows.length > 0) {
      console.table(result.rows);
      console.log('\n⚠️ WARNING: There are still triggers on amazon_po_header!');
    } else {
      console.log('✅ All problematic triggers have been removed from amazon_po_header');
    }
    console.log('\n✨ Next steps:');
    console.log('1. Try uploading your Amazon PO again');
    console.log('2. The po_master insertion is now handled by the code, not triggers');

  } catch (error) {
    console.error('❌ Error applying fix:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
applyAmazonTriggerFix()
  .then(() => {
    console.log('\n✨ Fix completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  });
