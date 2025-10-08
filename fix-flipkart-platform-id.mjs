// Fix the trigger to use correct Flipkart platform ID (10, not 6)
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function fixPlatformId() {
  console.log('🔧 Fixing Flipkart trigger with correct platform ID...\n');

  try {
    // Drop and recreate with correct platform ID
    console.log('Step 1: Dropping old trigger...');
    await db.execute(sql`DROP TRIGGER IF EXISTS trg_flipkart_po_lines_insert ON flipkart_grocery_po_lines CASCADE`);
    await db.execute(sql`DROP FUNCTION IF EXISTS trg_flipkart_po_lines_insert() CASCADE`);
    console.log('✅ Old trigger dropped\n');

    console.log('Step 2: Creating trigger with CORRECT platform ID (10 = Flipkart)...');
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION trg_flipkart_po_lines_insert()
      RETURNS TRIGGER AS $$
      BEGIN
          BEGIN
              INSERT INTO public.po_lines (
                  itemname, quantity, basic_amount, platform_product_code_id, sap_id,
                  uom, unitsize, isLiter, tax, boxes, total_liter, looseQty,
                  landing_amount, total_amount
              )
              SELECT DISTINCT ON (l.fsn_isbn)
                  l.title,
                  l.quantity,
                  COALESCE(l.supplier_price, '0'),
                  pim.id,
                  pim.sap_id,
                  COALESCE(i.invntryuom, 'PCS'),
                  COALESCE(i.salpackun, 1),
                  COALESCE(i.u_islitre, false),
                  COALESCE(i.u_tax_rate, '0'),
                  NULL::int,
                  COALESCE(l.quantity * i.salpackun, l.quantity),
                  CASE
                      WHEN i.salfactor2 IS NOT NULL AND i.salfactor2 > 0
                      THEN l.quantity - (l.quantity / i.salfactor2)
                      ELSE 0
                  END,
                  COALESCE(
                      CAST(l.supplier_price AS DECIMAL) + (CAST(l.supplier_price AS DECIMAL) * CAST(i.u_tax_rate AS DECIMAL))/100,
                      CAST(l.supplier_price AS DECIMAL)
                  ),
                  COALESCE(
                      l.quantity * (CAST(l.supplier_price AS DECIMAL) + CAST(i.u_tax_rate AS DECIMAL)),
                      l.quantity * CAST(l.supplier_price AS DECIMAL)
                  )
              FROM public.flipkart_grocery_po_lines l
              JOIN public.flipkart_grocery_po_header h ON h.id = l.header_id
              JOIN public.pf_item_mst pim ON pim.pf_itemcode = l.fsn_isbn AND pim.pf_id = CAST('10' AS INTEGER)
              LEFT JOIN public.items i ON (
                  CASE
                      WHEN pim.sap_id ~ '^[0-9]+$' THEN i.itemcode = CAST(pim.sap_id AS INTEGER)
                      ELSE FALSE
                  END
              )
              WHERE l.id = NEW.id
              ORDER BY l.fsn_isbn, pim.id
              LIMIT 1;
          EXCEPTION
              WHEN OTHERS THEN
                  RAISE WARNING 'Flipkart trigger failed for line % (FSN: %): %', NEW.id, NEW.fsn_isbn, SQLERRM;
          END;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Function created with platform ID = 10\n');

    console.log('Step 3: Creating trigger...');
    await db.execute(sql`
      CREATE TRIGGER trg_flipkart_po_lines_insert
          AFTER INSERT ON flipkart_grocery_po_lines
          FOR EACH ROW
          EXECUTE FUNCTION trg_flipkart_po_lines_insert();
    `);
    console.log('✅ Trigger created\n');

    console.log('═'.repeat(60));
    console.log('🎉 SUCCESS! Trigger fixed with correct platform ID!');
    console.log('═'.repeat(60));
    console.log('✅ Changed pf_id from 6 to 10 (Flipkart)');
    console.log('✅ Type casting for VARCHAR → INTEGER');
    console.log('✅ Error handling included');
    console.log('\n🚀 Now import a NEW Flipkart PO to test!');
    console.log('   (Old POs won\'t trigger since trigger is AFTER INSERT)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPlatformId();
