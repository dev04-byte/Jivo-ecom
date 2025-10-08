-- Fix the Flipkart trigger with proper type casting
-- This trigger auto-populates po_lines table when Flipkart lines are inserted

-- First, drop the old broken trigger
DROP TRIGGER IF EXISTS trg_flipkart_po_lines_insert ON flipkart_grocery_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_flipkart_po_lines_insert() CASCADE;

-- Create the fixed trigger function with proper type casting
CREATE OR REPLACE FUNCTION trg_flipkart_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into po_lines with proper type casting for sap_id (VARCHAR) to itemcode (INTEGER)
    INSERT INTO public.po_lines (
        itemname, quantity, basic_amount, platform_product_code_id, sap_id,
        uom, unitsize, isLiter, tax, boxes, total_liter, looseQty,
        landing_amount, total_amount
    )
    SELECT DISTINCT ON (l.fsn_isbn)
        l.title,
        l.quantity,
        l.supplier_price,
        pim.id,
        pim.sap_id,
        COALESCE(i.invntryuom, 'PCS'),
        COALESCE(i.salpackun, 1),
        COALESCE(i.u_islitre, false),
        COALESCE(i.u_tax_rate, 0),
        NULL::int,
        COALESCE(l.quantity * i.salpackun, l.quantity),
        CASE
            WHEN i.salfactor2 IS NOT NULL AND i.salfactor2 > 0
            THEN l.quantity - l.quantity / i.salfactor2
            ELSE 0
        END,
        COALESCE(l.supplier_price + (l.supplier_price * i.u_tax_rate)/100, l.supplier_price),
        COALESCE(l.quantity * (l.supplier_price + i.u_tax_rate), l.quantity * l.supplier_price)
    FROM public.flipkart_grocery_po_lines l
    JOIN public.flipkart_grocery_po_header h ON h.id = l.header_id
    JOIN public.pf_item_mst pim ON pim.pf_itemcode = l.fsn_isbn AND pim.pf_id = 6
    -- FIX: Cast VARCHAR sap_id to INTEGER for comparison with itemcode
    LEFT JOIN public.items i ON
        CASE
            WHEN pim.sap_id ~ '^[0-9]+$' THEN pim.sap_id::integer = i.itemcode
            ELSE false
        END
    WHERE l.id = NEW.id
    ORDER BY l.fsn_isbn, pim.id;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If trigger fails, log the error but don't block the insert
        RAISE WARNING 'Flipkart trigger failed for line %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trg_flipkart_po_lines_insert
    AFTER INSERT ON flipkart_grocery_po_lines
    FOR EACH ROW
    EXECUTE FUNCTION trg_flipkart_po_lines_insert();

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE '✅ Flipkart trigger has been fixed with proper type casting!';
    RAISE NOTICE '📌 The trigger now handles VARCHAR to INTEGER conversion properly.';
END $$;
