-- Disable the problematic Flipkart trigger that's causing the import to fail
DROP TRIGGER IF EXISTS trg_flipkart_po_lines_insert ON flipkart_grocery_po_lines CASCADE;
DROP FUNCTION IF EXISTS trg_flipkart_po_lines_insert() CASCADE;

-- If you need to re-enable it later with proper type casting, use:
-- CREATE OR REPLACE FUNCTION trg_flipkart_po_lines_insert()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Fixed trigger logic with proper type casting would go here
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
