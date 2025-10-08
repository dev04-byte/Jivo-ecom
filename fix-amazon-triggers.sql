-- Fix Amazon PO Header Triggers
-- Drop the problematic triggers that use invalid column names

-- Drop both duplicate triggers
DROP TRIGGER IF EXISTS trg_amazon_po_header_after_insert ON amazon_po_header;
DROP TRIGGER IF EXISTS trg_insert_amazon_po_header ON amazon_po_header;

-- Drop the trigger function
DROP FUNCTION IF EXISTS trg_amazon_po_header_insert();

-- Note: We don't need these triggers because the insertIntoPoMasterAndLines function
-- in storage.ts already handles inserting Amazon PO data into po_master table
-- with the correct column names.

-- Verify triggers are dropped
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'amazon_po_header'::regclass
AND NOT tgisinternal;
