-- Fix CityMall tables to match schema.ts definition
-- Add missing columns to city_mall_po_header

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add po_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'city_mall_po_header' AND column_name = 'po_date') THEN
        ALTER TABLE city_mall_po_header ADD COLUMN po_date TIMESTAMP;
    END IF;

    -- Add po_expiry_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'city_mall_po_header' AND column_name = 'po_expiry_date') THEN
        ALTER TABLE city_mall_po_header ADD COLUMN po_expiry_date TIMESTAMP;
    END IF;

    -- Add vendor_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'city_mall_po_header' AND column_name = 'vendor_name') THEN
        ALTER TABLE city_mall_po_header ADD COLUMN vendor_name VARCHAR(255);
    END IF;

    -- Add vendor_gstin column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'city_mall_po_header' AND column_name = 'vendor_gstin') THEN
        ALTER TABLE city_mall_po_header ADD COLUMN vendor_gstin VARCHAR(50);
    END IF;

    -- Add vendor_code column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'city_mall_po_header' AND column_name = 'vendor_code') THEN
        ALTER TABLE city_mall_po_header ADD COLUMN vendor_code VARCHAR(50);
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'city_mall_po_header'
ORDER BY ordinal_position;