-- Insert distributors into the distributors table
-- Run this SQL in your PostgreSQL database

INSERT INTO distributors (distributor_name) VALUES
  ('EVARA ENTERPRISES'),
  ('CHIRAG ENTERPRISES'),
  ('JIVO MART PRIVATE LIMITED'),
  ('BABA LOKENATH'),
  ('SUSTAINQUEST PRIVATE LIMITED'),
  ('KNOWTABLE'),
  ('KNOWTABLE ONLINE SERVICES PRIVATE LIMITED'),
  ('SHIV SHAKTI')
ON CONFLICT (distributor_name) DO NOTHING;

-- Verify the distributors were added
SELECT id, distributor_name FROM distributors ORDER BY distributor_name;