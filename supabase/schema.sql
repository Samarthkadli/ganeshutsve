-- =====================================================
-- Koppal Ganapathi Utsava 2026 — Database Schema
-- Run this in your Supabase SQL Editor
-- 10 Questions & 10-Point Rating System
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup (via trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. MANDALS TABLE
-- Participating Ganesh Mandals
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mandals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mandals ENABLE ROW LEVEL SECURITY;

-- Anyone can read and insert active mandals (for direct public evaluation)
CREATE POLICY "Public can view mandals"
  ON public.mandals FOR SELECT
  USING (true);

CREATE POLICY "Public can insert mandals"
  ON public.mandals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update mandals"
  ON public.mandals FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admins can do everything with mandals
CREATE POLICY "Admins can manage mandals"
  ON public.mandals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Index for search
CREATE INDEX IF NOT EXISTS idx_mandals_name ON public.mandals USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_mandals_active ON public.mandals(is_active);

-- =====================================================
-- 3. REVIEWS TABLE (10 Questions, 1 to 10 Points Scale)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mandal_id UUID NOT NULL REFERENCES public.mandals(id) ON DELETE CASCADE,
  idol_rating SMALLINT NOT NULL CHECK (idol_rating BETWEEN 1 AND 10),
  decoration_rating SMALLINT NOT NULL CHECK (decoration_rating BETWEEN 1 AND 10),
  lighting_rating SMALLINT NOT NULL CHECK (lighting_rating BETWEEN 1 AND 10),
  creativity_rating SMALLINT NOT NULL CHECK (creativity_rating BETWEEN 1 AND 10),
  cleanliness_rating SMALLINT NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 10),
  eco_friendly_rating SMALLINT NOT NULL CHECK (eco_friendly_rating BETWEEN 1 AND 10),
  cultural_rating SMALLINT NOT NULL CHECK (cultural_rating BETWEEN 1 AND 10),
  discipline_rating SMALLINT NOT NULL CHECK (discipline_rating BETWEEN 1 AND 10),
  facilities_rating SMALLINT NOT NULL CHECK (facilities_rating BETWEEN 1 AND 10),
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 10),
  feedback TEXT CHECK (char_length(feedback) <= 500),
  photo_url TEXT,
  reviewer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to submit and update reviews
CREATE POLICY "Public can insert review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update review"
  ON public.reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow public to view reviews
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Admins can read all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- 1. Add reviewer_email and updated_at columns
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_email TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Clean up existing duplicate reviews for the same user & mandal (keeps the newest review)
DELETE FROM public.reviews r1
USING public.reviews r2
WHERE r1.mandal_id = r2.mandal_id
  AND r1.user_id = r2.user_id
  AND (r1.created_at < r2.created_at OR (r1.created_at = r2.created_at AND r1.id < r2.id));

-- 3. Clean up existing duplicate reviews for the same email & mandal
DELETE FROM public.reviews r1
USING public.reviews r2
WHERE r1.mandal_id = r2.mandal_id
  AND r1.reviewer_email IS NOT NULL AND r1.reviewer_email != ''
  AND LOWER(r1.reviewer_email) = LOWER(r2.reviewer_email)
  AND (r1.created_at < r2.created_at OR (r1.created_at = r2.created_at AND r1.id < r2.id));

-- 4. Indexes for performance & unique constraints (1 review per email/user per mandal)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mandal_id ON public.reviews(mandal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_mandal_reviewer_email ON public.reviews(mandal_id, LOWER(reviewer_email)) WHERE reviewer_email IS NOT NULL AND reviewer_email != '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_mandal_user_id ON public.reviews(mandal_id, user_id) WHERE user_id IS NOT NULL;

-- =====================================================
-- 4. ADMIN VIEWS (10-Question Aggregation)
-- =====================================================

-- Mandal statistics view
DROP VIEW IF EXISTS public.mandal_stats CASCADE;
CREATE OR REPLACE VIEW public.mandal_stats AS
SELECT
  m.id,
  m.name,
  m.area,
  m.is_active,
  COUNT(r.id) AS total_reviews,
  COALESCE(
    ROUND(
      AVG(
        (r.idol_rating + r.decoration_rating + r.lighting_rating +
         r.creativity_rating + r.cleanliness_rating + r.eco_friendly_rating +
         r.cultural_rating + r.discipline_rating + r.facilities_rating +
         r.overall_rating)::NUMERIC / 10.0
      ), 2
    ), 0
  ) AS average_rating,
  COALESCE(ROUND(AVG(r.idol_rating::NUMERIC), 2), 0) AS avg_idol,
  COALESCE(ROUND(AVG(r.decoration_rating::NUMERIC), 2), 0) AS avg_decoration,
  COALESCE(ROUND(AVG(r.lighting_rating::NUMERIC), 2), 0) AS avg_lighting,
  COALESCE(ROUND(AVG(r.creativity_rating::NUMERIC), 2), 0) AS avg_creativity,
  COALESCE(ROUND(AVG(r.cleanliness_rating::NUMERIC), 2), 0) AS avg_cleanliness,
  COALESCE(ROUND(AVG(r.eco_friendly_rating::NUMERIC), 2), 0) AS avg_eco_friendly,
  COALESCE(ROUND(AVG(r.cultural_rating::NUMERIC), 2), 0) AS avg_cultural,
  COALESCE(ROUND(AVG(r.discipline_rating::NUMERIC), 2), 0) AS avg_discipline,
  COALESCE(ROUND(AVG(r.facilities_rating::NUMERIC), 2), 0) AS avg_facilities,
  COALESCE(ROUND(AVG(r.overall_rating::NUMERIC), 2), 0) AS avg_overall
FROM public.mandals m
LEFT JOIN public.reviews r ON m.id = r.mandal_id
GROUP BY m.id, m.name, m.area, m.is_active;
