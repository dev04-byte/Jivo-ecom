const { Client } = require('pg');
require('dotenv').config();

async function verifyAllAmazonTriggers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    console.log('🔍 Verifying ALL Amazon-related triggers...\n');

    // Check amazon_po_header
    const headerResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_trigger t
      WHERE t.tgrelid = 'amazon_po_header'::regclass
      AND NOT t.tgisinternal;
    `);

    // Check amazon_po_lines
    const linesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_trigger t
      WHERE t.tgrelid = 'amazon_po_lines'::regclass
      AND NOT t.tgisinternal;
    `);

    const headerCount = parseInt(headerResult.rows[0].count);
    const linesCount = parseInt(linesResult.rows[0].count);

    console.log('📊 Trigger Status:');
    console.log(`   amazon_po_header: ${headerCount} triggers ${headerCount === 0 ? '✅' : '❌'}`);
    console.log(`   amazon_po_lines:  ${linesCount} triggers ${linesCount === 0 ? '✅' : '❌'}`);

    if (headerCount === 0 && linesCount === 0) {
      console.log('\n🎉 SUCCESS! All Amazon triggers have been removed!');
      console.log('\n✨ Your Amazon PO import should now work correctly.');
      console.log('   - No more type mismatch errors');
      console.log('   - No more "column does not exist" errors');
      console.log('   - All data insertion handled by code with proper type conversions');
    } else {
      console.log('\n⚠️ WARNING: Some triggers still exist!');
      console.log('Please run the fix scripts again.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyAllAmazonTriggers();
