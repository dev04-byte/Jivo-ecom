-- Fix BigBasket PO Lines trigger with proper type conversions
-- This ensures all fields match the po_lines table schema exactly

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trg_insert_bigbasket_po_lines ON bigbasket_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_bigbasket_po_lines_insert() CASCADE;

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION public.trg_bigbasket_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        po_id, itemname, quantity, basic_amount, platform_product_code_id, sap_id,
        uom, unitsize, isLiter, tax, boxes, total_liter, looseQty,
        landing_amount, total_amount
    )
    SELECT DISTINCT ON (l.sku_code)
        (SELECT pm.id FROM po_master pm WHERE pm.po_number = h.po_number AND pm.platform_id = 2 LIMIT 1), -- po_id from po_master
        l.description::text,                         -- itemname: character(555)
        l.quantity::numeric,                         -- quantity: numeric(12,2)
        l.basic_cost::numeric,                       -- basic_amount: numeric(14,2)
        pim.id,                                      -- platform_product_code_id: integer
        pim.sap_id::text,                           -- sap_id: character(555)
        i.invntryuom::varchar,                      -- uom: varchar(50)
        i.salpackun::numeric,                        -- unitsize: numeric(14,2)
        i.u_islitre::text,                          -- isliter: character(555)
        i.u_tax_rate::numeric,                       -- tax: numeric(14,2)
        NULL::int,                                   -- boxes: integer
        CASE
            WHEN i.salpackun IS NOT NULL AND i.salpackun::numeric != 0
            THEN (l.quantity::numeric * i.salpackun::numeric)::numeric
            ELSE NULL
        END,                                         -- total_liter: numeric(14,2)
        CASE
            WHEN i.salfactor2 IS NOT NULL AND i.salfactor2::numeric != 0
            THEN (l.quantity::numeric - (l.quantity::numeric / i.salfactor2::numeric))::numeric
            ELSE NULL
        END,                                         -- looseqty: numeric(14,2)
        CASE
            WHEN l.basic_cost IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.basic_cost::numeric + (l.basic_cost::numeric * i.u_tax_rate::numeric) / 100)::numeric
            ELSE l.basic_cost::numeric
        END,                                         -- landing_amount: numeric(14,2)
        CASE
            WHEN l.basic_cost IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.quantity::numeric * (l.basic_cost::numeric + (l.basic_cost::numeric * i.u_tax_rate::numeric) / 100))::numeric
            ELSE NULL
        END                                          -- total_amount: numeric(14,2)
    FROM public.bigbasket_po_lines l
    JOIN public.bigbasket_po_header h ON h.id = l.po_id
    -- Cast types in JOIN conditions (pf_id is VARCHAR, sap_id is CHAR(100))
    JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = l.sku_code::text AND pim.pf_id::text = '12'
    JOIN public.items i ON TRIM(pim.sap_id)::text = i.itemcode::text
    WHERE l.id = NEW.id
    ORDER BY l.sku_code, pim.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_insert_bigbasket_po_lines
AFTER INSERT ON bigbasket_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_bigbasket_po_lines_insert();

-- Verify the trigger was created
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'bigbasket_po_lines'::regclass
AND NOT tgisinternal;
