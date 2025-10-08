// Fix the trigger using the existing database connection from the app
const { db } = require('./server/db.ts');
const { sql } = require('drizzle-orm');
const fs = require('fs');

async function fixTrigger() {
  try {
    console.log('🔧 Reading SQL fix file...');
    const sqlContent = fs.readFileSync('./fix-flipkart-trigger-final.sql', 'utf8');

    console.log('🔧 Applying trigger fix using app database connection...');

    // Split SQL into individual statements and execute them
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('DO $$')) {
        // Handle DO blocks specially
        await db.execute(sql.raw(statement + ';'));
      } else if (statement.trim()) {
        await db.execute(sql.raw(statement));
      }
    }

    console.log('✅ Trigger fix applied successfully!');
    console.log('🎉 Flipkart imports should work now!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 You need to run this SQL manually in your database:');
    console.error('\n1. Open pgAdmin, DBeaver, or your database tool');
    console.error('2. Connect to your database');
    console.error('3. Run the file: fix-flipkart-trigger-final.sql');
    process.exit(1);
  }
}

fixTrigger();
