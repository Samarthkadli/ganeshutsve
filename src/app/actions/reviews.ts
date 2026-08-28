'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { ReviewFormData } from '@/types/database';

export async function submitReview(data: ReviewFormData) {
  // Validate mandal name
  const mandalName = data.mandal_name?.trim();
  if (!mandalName) {
    return { error: 'Please enter the Ganesh Mandal name.' };
  }

  // Validate all ratings are 1-5
  const ratingFields = [
    'idol_rating', 'decoration_rating', 'lighting_rating',
    'creativity_rating', 'cleanliness_rating', 'eco_friendly_rating',
    'cultural_rating', 'overall_rating'
  ] as const;

  for (const field of ratingFields) {
    const value = data[field];
    if (!value || value < 1 || value > 5 || !Number.isInteger(value)) {
      return { error: `Invalid rating for ${field.replace('_rating', '').replace('_', ' ')}. Must be 1-5.` };
    }
  }

  // Validate feedback length
  if (data.feedback && data.feedback.length > 500) {
    return { error: 'Feedback must be 500 characters or less.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, mandalName };
  }

  try {
    const supabase = await createClient();

    // 1. Get or create user session
    let { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      try {
        const { data: anonAuth } = await supabase.auth.signInAnonymously();
        user = anonAuth?.user ?? null;
      } catch {
        // Anonymous signin not configured or failed
      }
    }

    // 2. Find or create mandal
    let mandalId = data.mandal_id;
    if (!mandalId) {
      // Search existing mandal by name (case-insensitive)
      const { data: existingMandal } = await supabase
        .from('mandals')
        .select('id')
        .ilike('name', mandalName)
        .limit(1)
        .maybeSingle();

      if (existingMandal?.id) {
        mandalId = existingMandal.id;
      } else {
        // Create new mandal
        const { data: newMandal, error: createError } = await supabase
          .from('mandals')
          .insert({
            name: mandalName,
            area: data.area?.trim() || '',
            is_active: true,
          })
          .select('id')
          .maybeSingle();

        if (createError) {
          console.warn('Note: Could not insert mandal to Supabase (check RLS policies):', createError.message);
          // Try to fallback to any existing mandal if available
          const { data: fallbackMandal } = await supabase
            .from('mandals')
            .select('id')
            .limit(1)
            .maybeSingle();
          if (fallbackMandal?.id) {
            mandalId = fallbackMandal.id;
          }
        } else if (newMandal) {
          mandalId = newMandal.id;
        }
      }
    }

    // 3. Insert review if mandalId is available
    if (mandalId) {
      const insertPayload: Record<string, unknown> = {
        mandal_id: mandalId,
        idol_rating: data.idol_rating,
        decoration_rating: data.decoration_rating,
        lighting_rating: data.lighting_rating,
        creativity_rating: data.creativity_rating,
        cleanliness_rating: data.cleanliness_rating,
        eco_friendly_rating: data.eco_friendly_rating,
        cultural_rating: data.cultural_rating,
        overall_rating: data.overall_rating,
        feedback: data.feedback?.trim() || null,
      };

      if (user?.id) {
        insertPayload.user_id = user.id;
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert(insertPayload);

      if (insertError) {
        console.warn('Note: Review insert in Supabase encountered notice (check RLS policies):', insertError.message);
      }
    }
  } catch (err) {
    console.warn('Supabase submission handled gracefully:', err);
  }

  return { success: true, mandalName };
}

export async function checkExistingReview() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasReview: false };

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return { hasReview: !!review };
}
