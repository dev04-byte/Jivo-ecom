-- Fix the Amazon trigger function to match actual po_master table structure
-- The actual po_master table has: po_number (unique), company, platform_id, serving_distributor,
-- po_date, expiry_date, appointment_date, region, state, city, area, dispatch_from, warehouse,
-- status, comments, attachment, created_by, created_at, updated_at

CREATE OR REPLACE FUNCTION public.trg_amazon_po_header_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.po_master (
        po_number,
        company,
        platform_id,
        serving_distributor,
        po_date,
        expiry_date,
        region,
        state,
        city,
        area,
        status,
        comments,
        created_by,
        created_at,
        updated_at
    )
    VALUES (
        NEW.po_number,
        COALESCE(NEW.buyer_name, 'Amazon'),  -- Use buyer_name as company
        6,  -- Platform ID for Amazon
        NEW.vendor_name,  -- Vendor name as serving distributor
        COALESCE(NEW.po_date, NOW()),  -- PO date with fallback
        NEW.delivery_date,  -- Delivery date as expiry
        COALESCE(NEW.ship_to_location, 'Unknown'),  -- Region from ship_to_location
        'Unknown',  -- State - default (not available in amazon_po_header)
        'Unknown',  -- City - default (not available in amazon_po_header)
        NEW.ship_to_location,  -- Area from ship_to_location
        COALESCE(NEW.status, 'OPEN'),  -- Status
        NEW.notes,  -- Comments from notes
        NEW.created_by,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (po_number) DO UPDATE SET
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$function$;

-- Create trigger for amazon_po_header if it doesn't exist
DROP TRIGGER IF EXISTS trg_amazon_po_header_after_insert ON amazon_po_header;
CREATE TRIGGER trg_amazon_po_header_after_insert
    AFTER INSERT ON amazon_po_header
    FOR EACH ROW
    EXECUTE FUNCTION trg_amazon_po_header_insert();

-- Create function to insert amazon_po_lines into po_lines
CREATE OR REPLACE FUNCTION public.trg_amazon_po_lines_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_po_master_id integer;
BEGIN
    -- Get the po_master_id from po_master using the po_number from amazon_po_header
    SELECT pm.id INTO v_po_master_id
    FROM po_master pm
    JOIN amazon_po_header aph ON aph.po_number = pm.po_number
    WHERE aph.id = NEW.po_header_id;

    -- Only insert if we found a matching po_master record
    IF v_po_master_id IS NOT NULL THEN
        INSERT INTO public.po_lines (
            po_master_id,
            line_number,
            item_name,
            platform_code,
            sap_code,
            uom,
            quantity,
            basic_amount,
            tax_percent,
            landing_amount,
            total_amount,
            hsn_code,
            status,
            created_at,
            updated_at
        )
        VALUES (
            v_po_master_id,
            NEW.line_number,
            COALESCE(NEW.product_name, 'Unknown'),  -- Item name
            COALESCE(NEW.sku, NEW.asin),  -- Platform code (SKU or ASIN)
            NEW.sku,  -- SAP code (use SKU)
            'PCS',  -- UOM default
            NEW.quantity_ordered,
            CAST(COALESCE(NEW.unit_cost, '0') AS numeric),
            CAST(COALESCE(NEW.tax_rate, '0') AS numeric),
            CAST(COALESCE(NEW.unit_cost, '0') AS numeric),  -- Landing amount = unit cost
            CAST(COALESCE(NEW.total_cost, '0') AS numeric),
            NEW.category,  -- HSN code from category field
            'Pending',
            NOW(),
            NOW()
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$function$;

-- Create trigger for amazon_po_lines if it doesn't exist
DROP TRIGGER IF EXISTS trg_amazon_po_lines_after_insert ON amazon_po_lines;
CREATE TRIGGER trg_amazon_po_lines_after_insert
    AFTER INSERT ON amazon_po_lines
    FOR EACH ROW
    EXECUTE FUNCTION trg_amazon_po_lines_insert();
