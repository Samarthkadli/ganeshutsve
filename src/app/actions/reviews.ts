'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { ReviewFormData } from '@/types/database';

export async function submitReview(data: ReviewFormData) {
  // Validate mandal name
  const mandalName = data.mandal_name?.trim();
  if (!mandalName) {
    return { error: 'Please enter the Ganesh Mandal name.' };
  }

  // Validate all 10 ratings are 1-10 points
  const ratingFields = [
    'idol_rating', 'decoration_rating', 'lighting_rating',
    'creativity_rating', 'cleanliness_rating', 'eco_friendly_rating',
    'cultural_rating', 'discipline_rating', 'facilities_rating', 'overall_rating'
  ] as const;

  for (const field of ratingFields) {
    const value = data[field];
    if (!value || value < 1 || value > 10 || !Number.isInteger(value)) {
      return { error: `Invalid rating for ${field.replace('_rating', '').replace('_', ' ')}. Must be between 1 and 10.` };
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
        // Anonymous signin not configured or failed — proceed without user
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
          console.error('Mandal insert error:', createError);
          return {
            error: `ಮಂಡಳಿ ನೋಂದಾಯಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ / Could not register mandal: ${createError.message}. Please run the SQL policy fix in Supabase.`,
          };
        } else if (newMandal) {
          mandalId = newMandal.id;
        }
      }
    }

    if (!mandalId) {
      return { error: 'ಮಂಡಳಿ ID ಸಿಗಲಿಲ್ಲ / Could not resolve Mandal ID. Please try again.' };
    }

    // 3. Insert review with 10 ratings
    const insertPayload: Record<string, unknown> = {
      mandal_id: mandalId,
      idol_rating: data.idol_rating,
      decoration_rating: data.decoration_rating,
      lighting_rating: data.lighting_rating,
      creativity_rating: data.creativity_rating,
      cleanliness_rating: data.cleanliness_rating,
      eco_friendly_rating: data.eco_friendly_rating,
      cultural_rating: data.cultural_rating,
      discipline_rating: data.discipline_rating,
      facilities_rating: data.facilities_rating,
      overall_rating: data.overall_rating,
      feedback: data.feedback?.trim() || null,
      photo_url: data.photo || null,
    };

    if (user?.id) {
      insertPayload.user_id = user.id;
    }

    const { error: insertError } = await supabase
      .from('reviews')
      .insert(insertPayload);

    if (!insertError && data.photo) {
      // Set mandal image_url if not set
      await supabase
        .from('mandals')
        .update({ image_url: data.photo })
        .eq('id', mandalId)
        .or('image_url.eq.,image_url.is.null');
    }

    if (insertError) {
      console.error('Review insert error:', insertError);
      if (insertError.code === '23505' || insertError.message?.includes('unique_user_review')) {
        return {
          error: 'ನೀವು ಈಗಾಗಲೇ ಈ ಮಂಡಳಿಗೆ ಮೌಲ್ಯಮಾಪನ ಸಲ್ಲಿಕೆ ಮಾಡಿದ್ದೀರಿ / You have already submitted an evaluation for this Mandal. Thank you!',
        };
      }
      return {
        error: `ಮೌಲ್ಯಮಾಪನ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ / Review could not be saved: ${insertError.message}. Please run the SQL policy fix in Supabase.`,
      };
    }

    return { success: true, mandalName };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('submitReview exception:', msg);
    return { error: `ದೋಷ ಉಂಟಾಯಿತು / Unexpected error: ${msg}` };
  }
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
