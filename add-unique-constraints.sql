-- Add unique constraints to PO header tables to prevent duplicate PO numbers

-- Add unique constraint to blinkit_po_header table
ALTER TABLE blinkit_po_header
ADD CONSTRAINT blinkit_po_header_po_number_unique UNIQUE (po_number);

-- Add unique constraint to zepto_po_header table
ALTER TABLE zepto_po_header
ADD CONSTRAINT zepto_po_header_po_number_unique UNIQUE (po_number);

-- Note: If these constraints already exist, you might get an error.
-- In that case, you can first drop the existing constraint:
-- ALTER TABLE blinkit_po_header DROP CONSTRAINT IF EXISTS blinkit_po_header_po_number_unique;
-- ALTER TABLE zepto_po_header DROP CONSTRAINT IF EXISTS zepto_po_header_po_number_unique;