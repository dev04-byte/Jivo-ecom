-- Fix the Zomato trigger function to match ACTUAL po_master table structure
-- The actual po_master table has these columns:
-- vendor_po_number, platform_id, distributor_id, series, company_id, po_date,
-- delivery_date, create_on, updated_on, status_id, dispatch_date, created_by,
-- dispatch_from, state_id, district_id, region, area, ware_house, invoice_date,
-- appointment_date, expiry_date

-- First, ensure Zomato platform exists in platforms table
INSERT INTO public.platforms (name) VALUES ('Zomato') ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trg_zomato_po_header_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_platform_id integer;
    v_distributor_id integer := 1;  -- Default distributor
    v_company_id integer := 1;  -- Default company
    v_status_id integer := 1;  -- Default status (OPEN)
BEGIN
    -- Get Zomato platform ID from platforms table
    SELECT id INTO v_platform_id FROM public.platforms WHERE name = 'Zomato' LIMIT 1;

    -- If platform doesn't exist, create it
    IF v_platform_id IS NULL THEN
        INSERT INTO public.platforms (name) VALUES ('Zomato') RETURNING id INTO v_platform_id;
    END IF;

    -- Try to get first available distributor
    SELECT id INTO v_distributor_id FROM public.distributors ORDER BY id LIMIT 1;
    IF v_distributor_id IS NULL THEN
        v_distributor_id := 1;  -- Fallback to 1
    END IF;

    -- Try to get first available company
    SELECT id INTO v_company_id FROM public.companies ORDER BY id LIMIT 1;
    IF v_company_id IS NULL THEN
        v_company_id := 1;  -- Fallback to 1
    END IF;

    -- Try to get OPEN status
    SELECT id INTO v_status_id FROM public.status_item WHERE status_name = 'Open' LIMIT 1;
    IF v_status_id IS NULL THEN
        v_status_id := 1;  -- Fallback to 1
    END IF;

    INSERT INTO public.po_master (
        vendor_po_number,
        platform_id,
        distributor_id,
        series,
        company_id,
        po_date,
        delivery_date,
        expiry_date,
        appointment_date,
        status_id,
        region,
        area,
        created_by,
        create_on,
        updated_on
    )
    VALUES (
        NEW.po_number,
        v_platform_id,  -- Platform ID for Zomato from platforms table
        v_distributor_id,  -- Distributor ID
        'Zomato',  -- Series
        v_company_id,  -- Company ID
        COALESCE(NEW.po_date, NOW()),  -- PO date with fallback
        NEW.expected_delivery_date,  -- Delivery date
        NEW.expected_delivery_date,  -- Expiry date (same as delivery)
        NULL,  -- Appointment date
        v_status_id,  -- Status ID
        COALESCE(NEW.ship_to_address, 'Unknown'),  -- Region from ship_to_address
        COALESCE(NEW.ship_to_address, 'Unknown'),  -- Area from ship_to_address
        COALESCE(NEW.uploaded_by, 'system'),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    )
    ON CONFLICT (vendor_po_number) DO UPDATE SET
        updated_on = EXCLUDED.updated_on;
    RETURN NEW;
END;
$function$;

-- Create trigger for zomato_po_header if it doesn't exist
DROP TRIGGER IF EXISTS trg_zomato_po_header_after_insert ON zomato_po_header;
CREATE TRIGGER trg_zomato_po_header_after_insert
    AFTER INSERT ON zomato_po_header
    FOR EACH ROW
    EXECUTE FUNCTION trg_zomato_po_header_insert();

-- Create function to insert zomato_po_items into po_lines
CREATE OR REPLACE FUNCTION public.trg_zomato_po_items_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_po_master_id integer;
    v_platform_id integer;
    v_platform_product_code_id integer;
BEGIN
    -- Get Zomato platform ID
    SELECT id INTO v_platform_id FROM public.platforms WHERE name = 'Zomato' LIMIT 1;

    -- Get the po_master_id from po_master using the po_number from zomato_po_header
    SELECT pm.id INTO v_po_master_id
    FROM po_master pm
    JOIN zomato_po_header zph ON zph.po_number = pm.vendor_po_number
    WHERE zph.id = NEW.po_header_id;

    -- Only insert if we found a matching po_master record
    IF v_po_master_id IS NOT NULL AND v_platform_id IS NOT NULL THEN
        -- Check if product exists in platform_product_codes
        SELECT id INTO v_platform_product_code_id
        FROM platform_product_codes
        WHERE platform_id = v_platform_id
          AND platform_code = COALESCE(NEW.product_number, 'UNKNOWN');

        -- If product doesn't exist, create it
        IF v_platform_product_code_id IS NULL THEN
            INSERT INTO platform_product_codes (
                platform_id,
                platform_code,
                sap_code,
                item_name,
                uom,
                tax
            )
            VALUES (
                v_platform_id,
                COALESCE(NEW.product_number, 'UNKNOWN'),
                COALESCE(NEW.product_number, 'UNKNOWN'),
                COALESCE(NEW.product_name, 'Unknown Product'),
                COALESCE(NEW.uom, 'PCS'),
                COALESCE(NEW.gst_rate, 0)
            )
            RETURNING id INTO v_platform_product_code_id;
        END IF;

        -- Insert into po_lines with actual column names
        INSERT INTO public.po_lines (
            po_id,
            platform_product_code_id,
            quantity,
            basic_amount,
            tax,
            landing_amount,
            total_amount,
            uom,
            status
        )
        VALUES (
            v_po_master_id,
            v_platform_product_code_id,
            CAST(COALESCE(NEW.quantity_ordered, 0) AS numeric),
            CAST(COALESCE(NEW.price_per_unit, '0') AS numeric),
            CAST(COALESCE(NEW.total_tax_amount, '0') AS numeric),
            CAST(COALESCE(NEW.price_per_unit, '0') AS numeric),  -- Landing amount = price per unit
            CAST(COALESCE(NEW.line_total, '0') AS numeric),
            COALESCE(NEW.uom, 'PCS'),
            1  -- Status ID (1 = pending/open)
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$function$;

-- Create trigger for zomato_po_items if it doesn't exist
DROP TRIGGER IF EXISTS trg_zomato_po_items_after_insert ON zomato_po_items;
CREATE TRIGGER trg_zomato_po_items_after_insert
    AFTER INSERT ON zomato_po_items
    FOR EACH ROW
    EXECUTE FUNCTION trg_zomato_po_items_insert();
