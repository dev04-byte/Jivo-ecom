import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import {
  flipkartGroceryPoHeader,
  flipkartGroceryPoLines,
  swiggyPos,
  blinkitPoHeader,
  zeptoPoHeader,
  poMaster,
  pfPo
} from './shared/schema.ts';

async function debugPO32() {
  console.log('🔍 DEBUGGING PO ID 32 - Checking all tables...');
  console.log('='.repeat(60));

  // Database connection
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/jivo_ecom';
  const sql = postgres(connectionString);
  const db = drizzle(sql);

  try {
    console.log('1️⃣ Checking flipkart_grocery_po_header...');
    const flipkartResult = await db.select().from(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.id, 32));
    console.log('Flipkart result:', flipkartResult);

    console.log('\n2️⃣ Checking swiggy_pos...');
    const swiggyResult = await db.select().from(swiggyPos).where(eq(swiggyPos.id, 32));
    console.log('Swiggy result:', swiggyResult);

    console.log('\n3️⃣ Checking blinkit_po_header...');
    const blinkitResult = await db.select().from(blinkitPoHeader).where(eq(blinkitPoHeader.id, 32));
    console.log('Blinkit result:', blinkitResult);

    console.log('\n4️⃣ Checking zepto_po_header...');
    const zeptoResult = await db.select().from(zeptoPoHeader).where(eq(zeptoPoHeader.id, 32));
    console.log('Zepto result:', zeptoResult);

    console.log('\n5️⃣ Checking po_master...');
    const masterResult = await db.select().from(poMaster).where(eq(poMaster.id, 32));
    console.log('Master result:', masterResult);

    console.log('\n6️⃣ Checking pf_po...');
    const pfResult = await db.select().from(pfPo).where(eq(pfPo.id, 32));
    console.log('PF result:', pfResult);

    console.log('\n7️⃣ Checking ALL Flipkart POs (first 10)...');
    const allFlipkart = await db.select().from(flipkartGroceryPoHeader).limit(10);
    console.log('All Flipkart POs:', allFlipkart.map(po => ({ id: po.id, po_number: po.po_number })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

debugPO32();