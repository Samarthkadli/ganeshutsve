-- =====================================================
-- Koppal Ganapathi Utsava 2026 — Database Schema
-- Run this in your Supabase SQL Editor
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
-- 3. REVIEWS TABLE
-- Public evaluations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mandal_id UUID NOT NULL REFERENCES public.mandals(id) ON DELETE CASCADE,
  idol_rating SMALLINT NOT NULL CHECK (idol_rating BETWEEN 1 AND 5),
  decoration_rating SMALLINT NOT NULL CHECK (decoration_rating BETWEEN 1 AND 5),
  lighting_rating SMALLINT NOT NULL CHECK (lighting_rating BETWEEN 1 AND 5),
  creativity_rating SMALLINT NOT NULL CHECK (creativity_rating BETWEEN 1 AND 5),
  cleanliness_rating SMALLINT NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
  eco_friendly_rating SMALLINT NOT NULL CHECK (eco_friendly_rating BETWEEN 1 AND 5),
  cultural_rating SMALLINT NOT NULL CHECK (cultural_rating BETWEEN 1 AND 5),
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  feedback TEXT CHECK (char_length(feedback) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to submit reviews
CREATE POLICY "Public can insert review"
  ON public.reviews FOR INSERT
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mandal_id ON public.reviews(mandal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- =====================================================
-- 4. ADMIN VIEWS (for dashboard aggregation)
-- These are database views that aggregate review data
-- Only accessible by admins via RLS
-- =====================================================

-- Mandal statistics view
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
         r.cultural_rating + r.overall_rating)::NUMERIC / 8.0
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
  COALESCE(ROUND(AVG(r.overall_rating::NUMERIC), 2), 0) AS avg_overall
FROM public.mandals m
LEFT JOIN public.reviews r ON m.id = r.mandal_id
GROUP BY m.id, m.name, m.area, m.is_active;
