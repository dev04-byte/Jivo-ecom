-- Fix Amazon PO Lines supplier_reference column to support longer JSON strings

-- Change supplier_reference from varchar(100) to text
ALTER TABLE amazon_po_lines
ALTER COLUMN supplier_reference TYPE text;

-- Verify the change
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'amazon_po_lines'
AND column_name = 'supplier_reference';
