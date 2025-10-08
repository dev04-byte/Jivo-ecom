-- Insert distributors directly into distributor_mst table (the main table the app uses)
INSERT INTO distributor_mst (distributor_name, status) VALUES
  ('EVARA ENTERPRISES', 'Active'),
  ('CHIRAG ENTERPRISES', 'Active'),
  ('JIVO MART PRIVATE LIMITED', 'Active'),
  ('BABA LOKENATH', 'Active'),
  ('SUSTAINQUEST PRIVATE LIMITED', 'Active'),
  ('KNOWTABLE', 'Active'),
  ('KNOWTABLE ONLINE SERVICES PRIVATE LIMITED', 'Active'),
  ('SHIV SHAKTI', 'Active')
ON CONFLICT (distributor_name) DO NOTHING;

-- Verify the data
SELECT id, distributor_name, status FROM distributor_mst ORDER BY distributor_name;