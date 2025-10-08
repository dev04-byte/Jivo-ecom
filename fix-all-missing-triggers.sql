-- ============================================================================
-- FIX ALL MISSING PLATFORM TRIGGERS
-- This script creates triggers for Amazon, Blinkit, Zepto, and Zomato
-- to sync data from platform-specific tables to po_master and po_lines
-- ============================================================================

-- ============================================================================
-- AMAZON TRIGGERS (Platform ID: 6)
-- ============================================================================

-- Drop existing Amazon triggers if any
DROP TRIGGER IF EXISTS trg_insert_amazon_po_header ON amazon_po_header CASCADE;
DROP FUNCTION IF EXISTS trg_amazon_po_header_insert() CASCADE;
DROP TRIGGER IF EXISTS trg_insert_amazon_po_lines ON amazon_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_amazon_po_lines_insert() CASCADE;

-- Create Amazon PO Header Trigger
CREATE OR REPLACE FUNCTION trg_amazon_po_header_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_master (
        platform_id,
        platform_name,
        po_number,
        po_date,
        distributor_name,
        expiry_date,
        delivery_date,
        created_by
    )
    VALUES (
        6,
        'Amazon',
        NEW.po_number,
        COALESCE(NEW.po_date, NEW.ordered_on::timestamp, CURRENT_TIMESTAMP),
        COALESCE(NEW.vendor_name::text, NEW.vendor::text),
        NULL,  -- Amazon doesn't have expiry date
        NEW.delivery_date,
        COALESCE(NEW.created_by::text, 'system')
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_amazon_po_header
AFTER INSERT ON amazon_po_header
FOR EACH ROW
EXECUTE FUNCTION trg_amazon_po_header_insert();

-- Create Amazon PO Lines Trigger
CREATE OR REPLACE FUNCTION trg_amazon_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        po_id,
        platform_product_code_id,
        itemname,
        quantity,
        basic_amount,
        total_amount,
        tax,
        sap_id,
        uom
    )
    SELECT
        (SELECT pm.id FROM po_master pm
         JOIN amazon_po_header h ON h.po_number = pm.po_number
         WHERE h.id = NEW.po_header_id::integer AND pm.platform_id = 6
         LIMIT 1),
        COALESCE(pim.id, 0),  -- Use 0 if no matching product found
        COALESCE(NEW.title::text, NEW.product_name::text, ''),
        COALESCE(NEW.quantity_ordered, NEW.quantity_requested, 0)::numeric,
        COALESCE(NEW.unit_cost, 0)::numeric,
        COALESCE(NEW.total_cost, NEW.net_amount, 0)::numeric,
        COALESCE(NEW.tax_amount, 0)::numeric,
        COALESCE(pim.sap_id::text, ''),
        'PCS'
    FROM amazon_po_header h
    LEFT JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = COALESCE(NEW.asin, NEW.external_id)::text AND pim.pf_id::text = '6'
    WHERE h.id = NEW.po_header_id::integer
    LIMIT 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_amazon_po_lines
AFTER INSERT ON amazon_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_amazon_po_lines_insert();

-- ============================================================================
-- BLINKIT TRIGGERS (Platform ID: 1)
-- ============================================================================

-- Drop existing Blinkit triggers if any
DROP TRIGGER IF EXISTS trg_insert_blinkit_po_header ON blinkit_po_header CASCADE;
DROP FUNCTION IF EXISTS trg_blinkit_po_header_insert() CASCADE;
DROP TRIGGER IF EXISTS trg_insert_blinkit_po_lines ON blinkit_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_blinkit_po_lines_insert() CASCADE;

-- Create Blinkit PO Header Trigger
CREATE OR REPLACE FUNCTION trg_blinkit_po_header_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_master (
        platform_id,
        platform_name,
        po_number,
        po_date,
        distributor_name,
        expiry_date
    )
    VALUES (
        1,
        'Blinkit',
        NEW.po_number,
        CASE
            WHEN NEW.po_date IS NOT NULL AND NEW.po_date != ''
            THEN NEW.po_date::timestamp
            ELSE CURRENT_TIMESTAMP
        END,
        NEW.delivered_by::text,
        CASE
            WHEN NEW.po_expiry_date IS NOT NULL AND NEW.po_expiry_date != ''
            THEN NEW.po_expiry_date::timestamp
            ELSE NULL
        END
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_blinkit_po_header
AFTER INSERT ON blinkit_po_header
FOR EACH ROW
EXECUTE FUNCTION trg_blinkit_po_header_insert();

-- Create Blinkit PO Lines Trigger
CREATE OR REPLACE FUNCTION trg_blinkit_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        po_id,
        platform_product_code_id,
        itemname,
        quantity,
        basic_amount,
        landing_amount,
        total_amount,
        tax,
        sap_id,
        uom,
        unitsize,
        isliter
    )
    SELECT DISTINCT ON (l.item_code)
        (SELECT pm.id FROM po_master pm
         JOIN blinkit_po_header h ON h.po_number = pm.po_number
         WHERE h.id = l.header_id AND pm.platform_id = 1
         LIMIT 1),
        pim.id,
        l.product_description::text,
        l.quantity::numeric,
        l.basic_cost_price::numeric,
        l.landing_rate::numeric,
        l.total_amount::numeric,
        l.tax_amount::numeric,
        pim.sap_id::text,
        i.invntryuom::varchar,
        i.salpackun::numeric,
        i.u_islitre::text
    FROM public.blinkit_po_lines l
    JOIN public.blinkit_po_header h ON h.id = l.header_id
    JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = l.item_code::text AND pim.pf_id::text = '1'
    LEFT JOIN public.items i ON TRIM(pim.sap_id)::text = i.itemcode::text
    WHERE l.id = NEW.id
    ORDER BY l.item_code, pim.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_blinkit_po_lines
AFTER INSERT ON blinkit_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_blinkit_po_lines_insert();

-- ============================================================================
-- ZEPTO TRIGGERS (Platform ID: 3)
-- ============================================================================

-- Drop existing Zepto triggers if any
DROP TRIGGER IF EXISTS trg_insert_zepto_po_header ON zepto_po_header CASCADE;
DROP FUNCTION IF EXISTS trg_zepto_po_header_insert() CASCADE;
DROP TRIGGER IF EXISTS trg_insert_zepto_po_lines ON zepto_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_zepto_po_lines_insert() CASCADE;

-- Create Zepto PO Header Trigger
CREATE OR REPLACE FUNCTION trg_zepto_po_header_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_master (
        platform_id,
        platform_name,
        po_number,
        po_date,
        distributor_name,
        expiry_date,
        created_by
    )
    VALUES (
        3,
        'Zepto',
        NEW.po_number,
        COALESCE(NEW.po_date, CURRENT_TIMESTAMP),
        NEW.vendor_name::text,
        NEW.po_expiry_date,
        COALESCE(NEW.created_by, 'system')
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_zepto_po_header
AFTER INSERT ON zepto_po_header
FOR EACH ROW
EXECUTE FUNCTION trg_zepto_po_header_insert();

-- Create Zepto PO Lines Trigger
CREATE OR REPLACE FUNCTION trg_zepto_po_lines_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_lines (
        po_id,
        platform_product_code_id,
        itemname,
        quantity,
        basic_amount,
        landing_amount,
        total_amount,
        tax,
        sap_id,
        uom,
        unitsize,
        isliter
    )
    SELECT DISTINCT ON (l.sku)
        (SELECT pm.id FROM po_master pm
         WHERE pm.po_number = l.po_number AND pm.platform_id = 3
         LIMIT 1),
        COALESCE(pim.id, 0),
        COALESCE(l.sku_desc::text, l.sku::text),
        l.po_qty::numeric,
        COALESCE(l.cost_price, 0)::numeric,
        COALESCE(l.landing_cost, l.cost_price, 0)::numeric,
        COALESCE(l.total_value, 0)::numeric,
        (COALESCE(l.cgst, 0) + COALESCE(l.sgst, 0) + COALESCE(l.igst, 0) + COALESCE(l.cess, 0))::numeric,
        COALESCE(l.sap_id, pim.sap_id)::text,
        i.invntryuom::varchar,
        i.salpackun::numeric,
        i.u_islitre::text
    FROM public.zepto_po_lines l
    LEFT JOIN public.pf_item_mst pim ON pim.pf_itemcode::text = l.sap_id::text AND pim.pf_id::text = '3'
    LEFT JOIN public.items i ON TRIM(COALESCE(l.sap_id, pim.sap_id))::text = i.itemcode::text
    WHERE l.id = NEW.id
    ORDER BY l.sku, pim.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_zepto_po_lines
AFTER INSERT ON zepto_po_lines
FOR EACH ROW
EXECUTE FUNCTION trg_zepto_po_lines_insert();

-- ============================================================================
-- ZOMATO TRIGGERS (Platform ID: 15)
-- Note: Zomato only has header table, no lines table
-- ============================================================================

-- Drop existing Zomato triggers if any
DROP TRIGGER IF EXISTS trg_insert_zomato_po_header ON zomato_po_header CASCADE;
DROP FUNCTION IF EXISTS trg_zomato_po_header_insert() CASCADE;

-- Create Zomato PO Header Trigger
CREATE OR REPLACE FUNCTION trg_zomato_po_header_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.po_master (
        platform_id,
        platform_name,
        po_number,
        po_date,
        distributor_name,
        delivery_date,
        created_by
    )
    VALUES (
        15,
        'Zomato',
        NEW.po_number,
        COALESCE(NEW.po_date, CURRENT_TIMESTAMP),
        NEW.bill_from_name::text,
        NEW.expected_delivery_date,
        COALESCE(NEW.uploaded_by, 'system')
    )
    ON CONFLICT (po_number, platform_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_zomato_po_header
AFTER INSERT ON zomato_po_header
FOR EACH ROW
EXECUTE FUNCTION trg_zomato_po_header_insert();

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Check all triggers were created successfully
SELECT
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    CASE t.tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        ELSE 'OTHER'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
    AND c.relname IN (
        'amazon_po_header', 'amazon_po_lines',
        'blinkit_po_header', 'blinkit_po_lines',
        'zepto_po_header', 'zepto_po_lines',
        'zomato_po_header'
    )
ORDER BY c.relname, t.tgname;
