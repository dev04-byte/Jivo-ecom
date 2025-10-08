-- Add missing distributors to the distributors table
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
