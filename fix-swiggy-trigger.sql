-- Fix the Swiggy PO Lines trigger to handle type conversions properly

-- First, drop the existing trigger and function (CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS trg_swiggy_po_lines_insert ON swiggy_po_lines;
DROP FUNCTION IF EXISTS trg_swiggy_po_lines_insert() CASCADE;

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION trg_swiggy_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        po_id, itemname, quantity, basic_amount, platform_product_code_id, sap_id,
        uom, unitsize, isLiter, tax, boxes, total_liter, looseQty,
        landing_amount, total_amount
    )
    SELECT DISTINCT ON (l.item_code)
        (SELECT pm.id FROM po_master pm WHERE pm.po_number = h.po_number AND pm.platform_id = 4 LIMIT 1), -- po_id from po_master
        l.item_description::text,                    -- Cast to text (itemname: character(555))
        l.quantity::numeric,                         -- Cast to numeric (quantity: numeric(12,2))
        l.unit_base_cost::numeric,                   -- Cast to numeric (basic_amount: numeric(14,2))
        pim.id,                                      -- Integer (platform_product_code_id: integer)
        pim.sap_id::text,                           -- Cast to text (sap_id: character(555))
        i.invntryuom::varchar,                      -- Cast to varchar (uom: varchar(50))
        i.salpackun::numeric,                        -- Cast to numeric (unitsize: numeric(14,2))
        i.u_islitre::text,                          -- Cast to text (isliter: character(555))
        i.u_tax_rate::numeric,                       -- Cast to numeric (tax: numeric(14,2))
        NULL::int,                                   -- NULL integer (boxes: integer)
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
            WHEN l.unit_base_cost IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.unit_base_cost::numeric + (l.unit_base_cost::numeric * i.u_tax_rate::numeric) / 100)::numeric
            ELSE l.unit_base_cost::numeric
        END,                                         -- landing_amount: numeric(14,2)
        CASE
            WHEN l.unit_base_cost IS NOT NULL AND i.u_tax_rate IS NOT NULL
            THEN (l.quantity::numeric * (l.unit_base_cost::numeric + (l.unit_base_cost::numeric * i.u_tax_rate::numeric) / 100))::numeric
            ELSE NULL
        END                                          -- total_amount: numeric(14,2)
    FROM public.swiggy_po_lines l
    JOIN public.swiggy_po_header h ON h.id = l.po_id
    -- Cast types in JOIN conditions (pf_id is VARCHAR, sap_id is CHAR(100))
    JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = l.item_code::text AND pim.pf_id::text = '7'
    JOIN public.items i ON TRIM(pim.sap_id)::text = i.itemcode::text
    WHERE l.id = NEW.id
    ORDER BY l.item_code, pim.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_swiggy_po_lines_insert
AFTER INSERT ON swiggy_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_swiggy_po_lines_insert();

-- Verify the trigger was created
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'swiggy_po_lines'::regclass
AND NOT tgisinternal;
