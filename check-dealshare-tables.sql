-- Check which Dealshare tables exist in the database
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('dealshare_po_header', 'dealshare_po_lines', 'dealshare_po_items')
ORDER BY table_name, ordinal_position;
