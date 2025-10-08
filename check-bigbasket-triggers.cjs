const { Pool } = require('pg');
require('dotenv').config();

async function checkTriggers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Checking BigBasket triggers...\n');

    // Check triggers on bigbasket_po_header table
    const headerTriggersResult = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        proname as function_name,
        tgenabled as enabled,
        pg_get_triggerdef(t.oid) as trigger_definition
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE tgrelid = 'bigbasket_po_header'::regclass
      AND NOT tgisinternal;
    `);

    console.log('📋 Triggers on bigbasket_po_header:\n');
    if (headerTriggersResult.rows.length === 0) {
      console.log('  ❌ No triggers found\n');
    } else {
      headerTriggersResult.rows.forEach(row => {
        console.log(`  ✅ ${row.trigger_name}`);
        console.log(`     Function: ${row.function_name}`);
        console.log(`     Enabled: ${row.enabled === 'O' ? 'Yes' : 'No'}`);
        console.log(`     Definition: ${row.trigger_definition}\n`);
      });
    }

    // Check triggers on bigbasket_po_lines table
    const linesTriggersResult = await pool.query(`
      SELECT
        tgname as trigger_name,
        tgrelid::regclass as table_name,
        proname as function_name,
        tgenabled as enabled,
        pg_get_triggerdef(t.oid) as trigger_definition
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE tgrelid = 'bigbasket_po_lines'::regclass
      AND NOT tgisinternal;
    `);

    console.log('📋 Triggers on bigbasket_po_lines:\n');
    if (linesTriggersResult.rows.length === 0) {
      console.log('  ❌ No triggers found\n');
    } else {
      linesTriggersResult.rows.forEach(row => {
        console.log(`  ✅ ${row.trigger_name}`);
        console.log(`     Function: ${row.function_name}`);
        console.log(`     Enabled: ${row.enabled === 'O' ? 'Yes' : 'No'}`);
        console.log(`     Definition: ${row.trigger_definition}\n`);
      });
    }

    // Get the trigger function definition for header
    if (headerTriggersResult.rows.length > 0) {
      const funcName = headerTriggersResult.rows[0].function_name;
      const funcDefResult = await pool.query(`
        SELECT pg_get_functiondef(oid) as definition
        FROM pg_proc
        WHERE proname = $1;
      `, [funcName]);

      console.log('📜 Trigger function definition for bigbasket_po_header:\n');
      console.log(funcDefResult.rows[0]?.definition || 'Not found');
      console.log('\n');
    }

    // Get the trigger function definition for lines
    if (linesTriggersResult.rows.length > 0) {
      const funcName = linesTriggersResult.rows[0].function_name;
      const funcDefResult = await pool.query(`
        SELECT pg_get_functiondef(oid) as definition
        FROM pg_proc
        WHERE proname = $1;
      `, [funcName]);

      console.log('📜 Trigger function definition for bigbasket_po_lines:\n');
      console.log(funcDefResult.rows[0]?.definition || 'Not found');
      console.log('\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkTriggers();
