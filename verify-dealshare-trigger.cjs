const { Client } = require('pg');
require('dotenv').config();

async function verifyDealShareTrigger() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    console.log('🔍 Verifying DealShare trigger...\n');

    // Check if trigger exists
    const result = await client.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        proname as function_name,
        tgenabled as enabled
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE tgrelid = 'dealshare_po_lines'::regclass
      AND NOT tgisinternal;
    `);

    if (result.rows.length > 0) {
      console.log('✅ Trigger found:');
      console.table(result.rows);

      // Show the function definition
      console.log('\n📝 Function definition:');
      const funcDef = await client.query(`
        SELECT pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        WHERE p.proname = 'trg_dealshare_po_lines_insert';
      `);

      if (funcDef.rows.length > 0) {
        console.log(funcDef.rows[0].definition);
      }
    } else {
      console.log('❌ No trigger found on dealshare_po_lines table');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyDealShareTrigger();
