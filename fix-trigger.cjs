// Script to fix the Flipkart trigger with proper type casting
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixTrigger() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-flipkart-trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔧 Applying trigger fix...');

    // Execute the SQL
    await client.query(sql);

    console.log('✅ Trigger fixed successfully!');
    console.log('\n🎉 The Flipkart trigger now has proper type casting!');
    console.log('📌 VARCHAR sap_id is now properly cast to INTEGER for comparison.');
    console.log('📌 The trigger also has error handling to prevent blocking inserts.');
    console.log('\n✨ You can now import Flipkart POs without errors!');

  } catch (error) {
    console.error('❌ Error fixing trigger:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

fixTrigger();
