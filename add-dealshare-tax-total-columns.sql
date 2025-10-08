-- Add tax_amount and total_value columns to dealshare_po_lines table
-- These columns will store calculated tax and total amounts for each line item

ALTER TABLE dealshare_po_lines
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS total_value NUMERIC(12, 2);

-- Add comments to document the columns
COMMENT ON COLUMN dealshare_po_lines.tax_amount IS 'Calculated tax amount: (buying_price * quantity * (gst% + cess%)) / 100';
COMMENT ON COLUMN dealshare_po_lines.total_value IS 'Total value including tax: gross_amount + tax_amount';

-- Verify the columns were added
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'dealshare_po_lines'
AND column_name IN ('tax_amount', 'total_value');
