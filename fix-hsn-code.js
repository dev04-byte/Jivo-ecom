import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function fixHsnCode() {
  try {
    console.log('🔧 Fixing hsn_code column length...');

    await db.execute(sql.raw('ALTER TABLE zepto_po_lines ALTER COLUMN hsn_code TYPE VARCHAR(50)'));
    console.log('✅ Updated hsn_code column to VARCHAR(50)');

    // Verify the change
    const result = await db.execute(sql`
      SELECT character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'zepto_po_lines'
      AND column_name = 'hsn_code'
    `);

    console.log(`✅ Verified: hsn_code is now VARCHAR(${result.rows[0].character_maximum_length})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix hsn_code:', error);
    process.exit(1);
  }
}

fixHsnCode();