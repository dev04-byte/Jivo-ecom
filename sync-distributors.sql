-- Copy distributors from 'distributors' table to 'distributor_mst' table
-- This ensures the app can find them

INSERT INTO distributor_mst (distributor_name, status)
SELECT distributor_name, 'Active'
FROM distributors
WHERE distributor_name NOT IN (SELECT distributor_name FROM distributor_mst)
ON CONFLICT (distributor_name) DO NOTHING;

-- Verify the data
SELECT id, distributor_name, status FROM distributor_mst ORDER BY distributor_name;