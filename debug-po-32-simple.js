import { db } from './server/db.js';
import { eq } from 'drizzle-orm';
import {
  flipkartGroceryPoHeader,
  swiggyPos,
  blinkitPoHeader,
  zeptoPoHeader,
  poMaster,
  pfPo
} from './shared/schema.ts';

async function debugPO32() {
  console.log('🔍 DEBUGGING PO ID 32 - Checking all tables...');
  console.log('='.repeat(60));

  try {
    console.log('1️⃣ Checking flipkart_grocery_po_header...');
    const flipkartResult = await db.select().from(flipkartGroceryPoHeader).where(eq(flipkartGroceryPoHeader.id, 32));
    console.log('Flipkart result count:', flipkartResult.length);
    if (flipkartResult.length > 0) {
      console.log('Flipkart PO 32:', flipkartResult[0]);
    }

    console.log('\n2️⃣ Checking swiggy_pos...');
    const swiggyResult = await db.select().from(swiggyPos).where(eq(swiggyPos.id, 32));
    console.log('Swiggy result count:', swiggyResult.length);

    console.log('\n3️⃣ Checking blinkit_po_header...');
    const blinkitResult = await db.select().from(blinkitPoHeader).where(eq(blinkitPoHeader.id, 32));
    console.log('Blinkit result count:', blinkitResult.length);

    console.log('\n4️⃣ Checking zepto_po_header...');
    const zeptoResult = await db.select().from(zeptoPoHeader).where(eq(zeptoPoHeader.id, 32));
    console.log('Zepto result count:', zeptoResult.length);

    console.log('\n5️⃣ Checking po_master...');
    const masterResult = await db.select().from(poMaster).where(eq(poMaster.id, 32));
    console.log('Master result count:', masterResult.length);

    console.log('\n6️⃣ Checking pf_po...');
    const pfResult = await db.select().from(pfPo).where(eq(pfPo.id, 32));
    console.log('PF result count:', pfResult.length);

    console.log('\n7️⃣ Checking ALL Flipkart POs (with IDs around 32)...');
    const allFlipkart = await db.select()
      .from(flipkartGroceryPoHeader)
      .where(eq(flipkartGroceryPoHeader.id, 32));
    console.log('Flipkart POs with ID 32:', allFlipkart);

    console.log('\n8️⃣ Checking first 5 Flipkart POs to see what IDs exist...');
    const firstFlipkart = await db.select().from(flipkartGroceryPoHeader).limit(5);
    console.log('First 5 Flipkart POs:', firstFlipkart.map(po => ({ id: po.id, po_number: po.po_number })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugPO32();