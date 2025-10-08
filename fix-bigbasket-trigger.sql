-- Fix the BigBasket trigger function to use correct column name
-- The issue: trigger uses 'created_on' but table has 'create_on'

CREATE OR REPLACE FUNCTION public.trg_bigbasket_po_header_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.po_master (
        platform_id, platform_name, po_number, distributor_name, po_date, expiry_date, create_on, updated_on, created_by
    )
    VALUES (
        2,
        'B',  -- Using 'B' for BigBasket as per platform_name column type (character, single char)
        NEW.po_number,
        NEW.supplier_name,
        NEW.po_date,
        NEW.po_expiry_date,
        NEW.created_at,  -- Maps to create_on
        NEW.updated_at,   -- Maps to updated_on
        NEW.created_by
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;
    RETURN NEW;
END;
$function$;
