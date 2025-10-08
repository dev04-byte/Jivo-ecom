const { Client } = require('pg');
require('dotenv').config();

async function checkAmazonLinesTriggers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    console.log('🔍 Checking for triggers on amazon_po_lines table...\n');

    // Get all triggers on amazon_po_lines
    const result = await client.query(`
      SELECT
        t.tgname as trigger_name,
        t.tgrelid::regclass as table_name,
        p.proname as function_name,
        t.tgenabled as enabled,
        pg_get_triggerdef(t.oid) as trigger_definition
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = 'amazon_po_lines'::regclass
      AND NOT t.tgisinternal
      ORDER BY t.tgname;
    `);

    if (result.rows.length > 0) {
      console.log('📋 Found triggers on amazon_po_lines:');
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Trigger: ${row.trigger_name}`);
        console.log(`   Function: ${row.function_name}`);
        console.log(`   Enabled: ${row.enabled === 'O' ? 'Yes' : 'No'}`);
        console.log(`   Definition: ${row.trigger_definition}`);
      });

      // Get function definitions
      console.log('\n\n📝 Function Definitions:');
      for (const row of result.rows) {
        const funcDef = await client.query(`
          SELECT pg_get_functiondef(p.oid) as definition
          FROM pg_proc p
          WHERE p.proname = $1
          LIMIT 1;
        `, [row.function_name]);

        if (funcDef.rows.length > 0) {
          console.log(`\n--- Function: ${row.function_name} ---`);
          console.log(funcDef.rows[0].definition);
        }
      }
    } else {
      console.log('✅ No triggers found on amazon_po_lines table');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAmazonLinesTriggers();
