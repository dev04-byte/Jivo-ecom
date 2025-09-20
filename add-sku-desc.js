import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function addSkuDesc() {
  try {
    await db.execute(sql.raw('ALTER TABLE zepto_po_lines ADD COLUMN IF NOT EXISTS sku_desc TEXT'));
    console.log('✅ Added sku_desc column');
    process.exit(0);
  } catch (error) {
    if (error.code === '42701') {
      console.log('ℹ️ Column sku_desc already exists');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

addSkuDesc();