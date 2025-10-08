-- Fix the DealShare PO Lines trigger to handle type conversions properly

-- First, drop the existing trigger and function (CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS trg_dealshare_po_lines_insert ON dealshare_po_lines;
DROP FUNCTION IF EXISTS trg_dealshare_po_lines_insert() CASCADE;

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION trg_dealshare_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        itemname, quantity, basic_amount, platform_product_code_id, sap_id,
        uom, unitsize, isLiter, tax, boxes, total_liter, looseQty,
        landing_amount, total_amount
    )
    SELECT DISTINCT ON (l.sku)
        l.product_name::text,                       -- Cast to text (itemname)
        l.quantity::numeric,                         -- Cast to numeric (quantity)
        l.buying_price::numeric,                     -- Cast to numeric (basic_amount)
        pim.id,                                      -- Integer (platform_product_code_id)
        pim.sap_id::text,                           -- Cast to text (sap_id)
        i.invntryuom::varchar,                      -- Cast to varchar (uom)
        i.salpackun::numeric,                        -- Cast to numeric (unitsize)
        i.u_islitre::text,                          -- Cast to text (isliter)
        i.u_tax_rate::numeric,                       -- Cast to numeric (tax)
        NULL::int,                                   -- NULL integer (boxes)
        CASE
            WHEN i.salpackun IS NOT NULL AND i.salpackun::numeric != 0
            THEN (l.quantity::numeric * i.salpackun::numeric)::numeric
            ELSE NULL
        END,                                         -- total_liter
        CASE
            WHEN i.salfactor2 IS NOT NULL AND i.salfactor2::numeric != 0
            THEN (l.quantity::numeric - (l.quantity::numeric / i.salfactor2::numeric))::numeric
            ELSE NULL
        END,                                         -- looseqty
        CASE
            WHEN l.buying_price IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.buying_price::numeric + (l.buying_price::numeric * i.u_tax_rate::numeric) / 100)::numeric
            ELSE l.buying_price::numeric
        END,                                         -- landing_amount
        CASE
            WHEN l.buying_price IS NOT NULL AND l.quantity IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.quantity::numeric * (l.buying_price::numeric + (l.buying_price::numeric * i.u_tax_rate::numeric) / 100))::numeric
            ELSE NULL
        END                                          -- total_amount
    FROM public.dealshare_po_lines l
    JOIN public.dealshare_po_header h ON h.id = l.po_header_id
    -- Cast types in JOIN conditions to avoid type mismatch errors
    JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = l.sku::text AND pim.pf_id::int = 5
    JOIN public.items i ON TRIM(pim.sap_id)::text = i.itemcode::text
    WHERE l.id = NEW.id
    ORDER BY l.sku, pim.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_dealshare_po_lines_insert
AFTER INSERT ON dealshare_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_dealshare_po_lines_insert();

-- Verify the trigger was created
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'dealshare_po_lines'::regclass
AND NOT tgisinternal;
