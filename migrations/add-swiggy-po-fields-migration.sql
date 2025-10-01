-- Add missing fields to swiggy_po_header table
ALTER TABLE swiggy_po_header
ADD COLUMN IF NOT EXISTS po_modified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS po_amount DECIMAL(15, 2);

-- Add missing fields to swiggy_po_lines table
ALTER TABLE swiggy_po_lines
ADD COLUMN IF NOT EXISTS expected_delivery_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS po_expiry_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS otb_reference_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS internal_external_po VARCHAR(50);

-- Add comments to document the changes
COMMENT ON COLUMN swiggy_po_header.po_modified_at IS 'Last modification date/time of the PO';
COMMENT ON COLUMN swiggy_po_header.po_amount IS 'Original PO amount from Swiggy CSV';

COMMENT ON COLUMN swiggy_po_lines.expected_delivery_date IS 'Expected delivery date for this line item';
COMMENT ON COLUMN swiggy_po_lines.po_expiry_date IS 'PO expiry date for this line item';
COMMENT ON COLUMN swiggy_po_lines.otb_reference_number IS 'OTB (Open to Buy) reference number';
COMMENT ON COLUMN swiggy_po_lines.internal_external_po IS 'Type of PO: internal or external';
