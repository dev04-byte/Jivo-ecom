// Quick script to disable the problematic trigger
const { Client } = require('pg');

async function disableTrigger() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop the trigger
    await client.query('DROP TRIGGER IF EXISTS trg_flipkart_po_lines_insert ON flipkart_grocery_po_lines CASCADE');
    console.log('✅ Trigger dropped successfully');

    // Drop the function
    await client.query('DROP FUNCTION IF EXISTS trg_flipkart_po_lines_insert() CASCADE');
    console.log('✅ Function dropped successfully');

    console.log('\n🎉 Flipkart trigger has been disabled!');
    console.log('You can now import Flipkart POs without the operator error.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

disableTrigger();
