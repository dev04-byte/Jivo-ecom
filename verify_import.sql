-- Verify Blinkit PO Import Success
-- Check if data was successfully imported into blinkit_po_header and blinkit_po_lines tables

-- Check header table
SELECT
    id,
    po_number,
    po_date,
    vendor_name,
    buyer_name,
    total_quantity,
    total_items,
    net_amount
FROM blinkit_po_header
ORDER BY id DESC
LIMIT 5;

-- Check line items table
SELECT
    l.id,
    l.header_id,
    h.po_number,
    l.item_code,
    l.product_description,
    l.quantity,
    l.total_amount
FROM blinkit_po_lines l
JOIN blinkit_po_header h ON l.header_id = h.id
ORDER BY l.id DESC
LIMIT 10;

-- Count total records
SELECT
    (SELECT COUNT(*) FROM blinkit_po_header) as total_headers,
    (SELECT COUNT(*) FROM blinkit_po_lines) as total_lines;