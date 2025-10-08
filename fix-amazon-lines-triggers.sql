-- Fix Amazon PO Lines Triggers
-- Drop the problematic triggers that cause type mismatch errors

-- Drop both duplicate triggers
DROP TRIGGER IF EXISTS trg_amazon_po_lines_after_insert ON amazon_po_lines;
DROP TRIGGER IF EXISTS trg_insert_amazon_po_lines ON amazon_po_lines;

-- Drop the trigger function
DROP FUNCTION IF EXISTS trg_amazon_po_lines_insert();

-- Note: We don't need these triggers because the insertIntoPoMasterAndLines function
-- in storage.ts already handles inserting Amazon PO lines into po_lines table
-- with proper type conversions and error handling.

-- Verify triggers are dropped
SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'amazon_po_lines'::regclass
AND NOT tgisinternal;
