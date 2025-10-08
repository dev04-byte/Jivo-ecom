const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyAmazonLinesTriggerFix() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔧 Connecting to database...');
    await client.connect();

    console.log('🔧 Applying Amazon PO Lines trigger fix...');

    // Read the SQL fix file
    const sqlFix = fs.readFileSync(
      path.join(__dirname, 'fix-amazon-lines-triggers.sql'),
      'utf8'
    );

    // Execute the fix
    const result = await client.query(sqlFix);

    console.log('✅ Amazon PO Lines triggers fixed successfully!');
    console.log('\n📋 Verification result:');
    if (result.rows && result.rows.length > 0) {
      console.table(result.rows);
      console.log('\n⚠️ WARNING: There are still triggers on amazon_po_lines!');
    } else {
      console.log('✅ All problematic triggers have been removed from amazon_po_lines');
    }
    console.log('\n✨ Next steps:');
    console.log('1. Try uploading your Amazon PO again');
    console.log('2. The po_lines insertion is now handled by the code, not triggers');
    console.log('3. Type conversions are handled properly in the code');

  } catch (error) {
    console.error('❌ Error applying fix:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
applyAmazonLinesTriggerFix()
  .then(() => {
    console.log('\n✨ Fix completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  });
