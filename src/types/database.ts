// =====================================================
// Database Types for Koppal Ganapathi Utsava 2026
// =====================================================

export interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Mandal {
  id: string;
  name: string;
  area: string;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  mandal_id: string;
  idol_rating: number;
  decoration_rating: number;
  lighting_rating: number;
  creativity_rating: number;
  cleanliness_rating: number;
  eco_friendly_rating: number;
  cultural_rating: number;
  overall_rating: number;
  feedback: string | null;
  created_at: string;
}

export interface MandalStats {
  id: string;
  name: string;
  area: string;
  is_active: boolean;
  total_reviews: number;
  average_rating: number;
  avg_idol: number;
  avg_decoration: number;
  avg_lighting: number;
  avg_creativity: number;
  avg_cleanliness: number;
  avg_eco_friendly: number;
  avg_cultural: number;
  avg_overall: number;
}

export interface ReviewWithEmail extends Review {
  profiles?: {
    email: string;
  };
}

// Form data for submitting a review
export interface ReviewFormData {
  mandal_name: string;
  mandal_id?: string;
  area?: string;
  idol_rating: number;
  decoration_rating: number;
  lighting_rating: number;
  creativity_rating: number;
  cleanliness_rating: number;
  eco_friendly_rating: number;
  cultural_rating: number;
  overall_rating: number;
  feedback?: string;
}

// Form data for mandal management
export interface MandalFormData {
  name: string;
  area: string;
  description: string;
  image_url: string;
  is_active: boolean;
}
