-- Fix the Blinkit PO trigger to properly cast varchar dates to timestamps
DROP TRIGGER IF EXISTS trg_blinkit_po_header_insert ON blinkit_po_header CASCADE;
DROP FUNCTION IF EXISTS trg_blinkit_po_header_insert() CASCADE;

-- Recreate the trigger function with proper varchar to timestamp casting
CREATE OR REPLACE FUNCTION trg_blinkit_po_header_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_master (
        platform_id, platform_name, po_number, distributor_name, po_date, expiry_date
    )
    VALUES (
        1, 'Blinkit',
        NEW.po_number,
        NEW.delivered_by,
        CASE
            WHEN NEW.po_date IS NOT NULL AND NEW.po_date != ''
            THEN NEW.po_date::timestamp
            ELSE NULL
        END,  -- Cast varchar to timestamp with null handling
        CASE
            WHEN NEW.po_expiry_date IS NOT NULL AND NEW.po_expiry_date != ''
            THEN NEW.po_expiry_date::timestamp
            ELSE NULL
        END  -- Cast varchar to timestamp with null handling
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trg_blinkit_po_header_insert
    AFTER INSERT ON blinkit_po_header
    FOR EACH ROW
    EXECUTE FUNCTION trg_blinkit_po_header_insert();
