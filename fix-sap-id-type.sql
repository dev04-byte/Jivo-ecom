-- Fix sap_id column type mismatch in pf_item_mst table
-- The column is currently INTEGER but the schema expects VARCHAR(50)

ALTER TABLE pf_item_mst ALTER COLUMN sap_id TYPE VARCHAR(50) USING sap_id::VARCHAR;
