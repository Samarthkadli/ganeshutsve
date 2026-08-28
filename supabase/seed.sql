-- =====================================================
-- Koppal Ganapathi Utsava 2026 — Seed Data
-- Sample mandals for development
-- Replace with actual mandal names when provided
-- =====================================================

-- =====================================================
-- SAMPLE MANDALS (replace with actual data)
-- =====================================================
INSERT INTO public.mandals (name, area, description, is_active) VALUES
  ('Sri Ganesh Mandal', 'Station Road', 'One of the oldest and most revered Ganesh Mandals in Koppal', TRUE),
  ('Yuva Ganesh Mandal', 'Bhagyanagar', 'Youth-led mandal known for innovative celebrations', TRUE),
  ('Bal Ganesh Mandal', 'Gandhi Chowk', 'Community mandal promoting children participation', TRUE),
  ('Friends Ganesh Mandal', 'Hosapete Road', 'Group of friends celebrating together since 2010', TRUE),
  ('Jai Ganesh Mandal', 'Kinnal Road', 'Famous for traditional Kinnal art themed decorations', TRUE),
  ('Shree Siddhivinayak Mandal', 'Gavimath Road', 'Known for grand scale celebrations', TRUE),
  ('Navayuga Ganesh Mandal', 'Almatti Colony', 'Modern and eco-friendly celebrations', TRUE),
  ('Ek Dant Ganesh Mandal', 'Munirabad Road', 'Cultural programs and community service focused', TRUE),
  ('Vighnaharta Ganesh Mandal', 'Raichur Road', 'Artistic decorations and themed pandals', TRUE),
  ('Sarvajanik Ganesh Mandal', 'Bus Stand Area', 'Public mandal with large community participation', TRUE),
  ('Panchamukhi Ganesh Mandal', 'Koppal Fort Area', 'Heritage themed celebrations near the historic fort', TRUE),
  ('Mangalmurti Ganesh Mandal', 'Gangavathi Road', 'Known for elaborate lighting arrangements', TRUE),
  ('Vakratunda Ganesh Mandal', 'Vijayanagar Colony', 'Focus on eco-friendly and sustainable celebrations', TRUE),
  ('Ganapathi Seva Mandal', 'Market Area', 'Social service oriented mandal', TRUE),
  ('Lambodara Ganesh Mandal', 'Kuknoor Road', 'Community driven with strong cultural programs', TRUE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADMIN USER SETUP
-- After running this seed, create an admin user:
--
-- 1. Sign up through the app or create a user in
--    Supabase Dashboard > Authentication > Users
--
-- 2. Then run this SQL to make them admin:
--    UPDATE public.profiles
--    SET is_admin = TRUE
--    WHERE email = 'your-admin-email@example.com';
--
-- =====================================================
