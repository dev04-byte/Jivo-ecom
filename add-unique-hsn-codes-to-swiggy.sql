-- Add unique_hsn_codes column to swiggy_po_header table
ALTER TABLE swiggy_po_header
ADD COLUMN IF NOT EXISTS unique_hsn_codes text[];

-- Add hsn_code column to swiggy_po_lines table
ALTER TABLE swiggy_po_lines
ADD COLUMN IF NOT EXISTS hsn_code varchar(20);

-- Add comments to describe the columns
COMMENT ON COLUMN swiggy_po_header.unique_hsn_codes IS 'Array of unique HSN codes from all line items in this PO';
COMMENT ON COLUMN swiggy_po_lines.hsn_code IS 'HSN (Harmonized System of Nomenclature) code for the line item';
