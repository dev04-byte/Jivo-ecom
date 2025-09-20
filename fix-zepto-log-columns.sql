-- Fix zepto_po_header_log column constraints
-- The status field is too small for values like 'PENDING_ACKNOWLEDGEMENT'

ALTER TABLE zepto_po_header_log
ALTER COLUMN original_status TYPE character varying(50);

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'zepto_po_header_log'
AND column_name = 'original_status';