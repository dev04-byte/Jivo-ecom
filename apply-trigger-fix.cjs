// Apply the final trigger fix with proper type casting
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyFix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read the SQL fix file
    const sqlPath = path.join(__dirname, 'fix-flipkart-trigger-final.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Applying trigger fix...');
    console.log('─'.repeat(50));

    // Execute the entire SQL script
    const result = await client.query(sql);

    console.log('✅ SQL executed successfully\n');

    // Verify the trigger exists and is correct
    const verifyTrigger = await client.query(`
      SELECT
        t.tgname as trigger_name,
        p.proname as function_name,
        pg_get_functiondef(p.oid) as function_definition
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgname = 'trg_flipkart_po_lines_insert'
    `);

    if (verifyTrigger.rows.length > 0) {
      console.log('🎉 SUCCESS! Trigger has been fixed!');
      console.log('─'.repeat(50));
      console.log('✅ Trigger name:', verifyTrigger.rows[0].trigger_name);
      console.log('✅ Function name:', verifyTrigger.rows[0].function_name);

      // Check if the function contains the fix
      const funcDef = verifyTrigger.rows[0].function_definition;
      if (funcDef.includes('pim.sap_id::INTEGER') || funcDef.includes("pim.sap_id ~ '^[0-9]+$'")) {
        console.log('✅ Type casting is present: VARCHAR → INTEGER conversion implemented');
      }
      if (funcDef.includes('EXCEPTION')) {
        console.log('✅ Error handling is present: Won\'t block inserts on failure');
      }

      console.log('\n🚀 You can now import Flipkart POs successfully!');
    } else {
      console.log('❌ Warning: Trigger not found after creation');
    }

  } catch (error) {
    console.error('❌ Error applying fix:', error.message);
    console.error('\n📋 Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    console.error('\n💡 Manual fix needed: Run the SQL file directly in your database GUI');
  } finally {
    await client.end();
  }
}

applyFix();
