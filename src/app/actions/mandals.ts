'use server';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Mandal, MandalFormData, MandalStats } from '@/types/database';

const SAMPLE_MANDALS_FALLBACK: Mandal[] = [];

export async function searchExistingMandals(query: string) {
  const q = query.trim();
  if (!q || q.length < 1) {
    return { mandals: [] };
  }

  if (!isSupabaseConfigured()) {
    return { mandals: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('mandals')
      .select('id, name, area')
      .ilike('name', `%${q}%`)
      .eq('is_active', true)
      .limit(6);

    if (error) {
      console.error('Error searching mandals:', error);
      return { mandals: [] };
    }

    return { mandals: data || [] };
  } catch (err) {
    console.error('Search mandals exception:', err);
    return { mandals: [] };
  }
}

export async function getActiveMandals() {
  if (!isSupabaseConfigured()) {
    return { mandals: [] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mandals')
    .select('id, name, area')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching mandals:', error);
    return { mandals: [], error: 'Failed to load mandals.' };
  }

  return { mandals: data || [] };
}

export async function getAllMandals() {
  if (!isSupabaseConfigured()) {
    return { mandals: SAMPLE_MANDALS_FALLBACK };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mandals')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching mandals:', error);
    return { mandals: [], error: 'Failed to load mandals.' };
  }

  return { mandals: data || [] };
}

export async function getMandalStats() {
  if (!isSupabaseConfigured()) {
    const stats: MandalStats[] = SAMPLE_MANDALS_FALLBACK.map((m, idx) => ({
      id: m.id,
      name: m.name,
      area: m.area,
      is_active: m.is_active,
      total_reviews: 15 - idx,
      average_rating: +(9.4 - idx * 0.1).toFixed(2),
      avg_idol: 9.6,
      avg_decoration: 9.4,
      avg_lighting: 9.2,
      avg_creativity: 9.4,
      avg_cleanliness: 9.0,
      avg_eco_friendly: 8.8,
      avg_cultural: 9.2,
      avg_discipline: 9.1,
      avg_facilities: 9.0,
      avg_overall: 9.6,
    }));
    return { stats };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('mandal_stats')
    .select('*')
    .order('total_reviews', { ascending: false });

  if (error) {
    console.error('Error fetching mandal stats:', error);
    return { stats: [], error: 'Failed to load statistics.' };
  }

  return { stats: data || [] };
}

export async function getMandalDetail(mandalId: string) {
  if (!isSupabaseConfigured()) {
    const mandal = SAMPLE_MANDALS_FALLBACK.find((m) => m.id === mandalId) || SAMPLE_MANDALS_FALLBACK[0];
    const stats: MandalStats = {
      id: mandal.id,
      name: mandal.name,
      area: mandal.area,
      is_active: mandal.is_active,
      total_reviews: 12,
      average_rating: 9.4,
      avg_idol: 9.6,
      avg_decoration: 9.4,
      avg_lighting: 9.2,
      avg_creativity: 9.4,
      avg_cleanliness: 9.0,
      avg_eco_friendly: 8.8,
      avg_cultural: 9.2,
      avg_discipline: 9.1,
      avg_facilities: 9.0,
      avg_overall: 9.6,
    };
    return { stats, reviews: [] };
  }

  const supabase = await createClient();

  // Get mandal info + stats
  const { data: stats, error: statsError } = await supabase
    .from('mandal_stats')
    .select('*')
    .eq('id', mandalId)
    .single();

  if (statsError) {
    return { stats: null, reviews: [], error: 'Mandal not found.' };
  }

  // Get individual reviews with user emails
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id (email)
    `)
    .eq('mandal_id', mandalId)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
    return { stats, reviews: [], error: 'Failed to load reviews.' };
  }

  return { stats, reviews: reviews || [] };
}

export async function createMandal(data: MandalFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('mandals')
    .insert({
      name: data.name.trim(),
      area: data.area?.trim() || '',
      description: data.description?.trim() || '',
      image_url: data.image_url?.trim() || '',
      is_active: data.is_active,
    });

  if (error) {
    console.error('Create mandal error:', error);
    return { error: 'Failed to create mandal.' };
  }

  return { success: true };
}

export async function updateMandal(id: string, data: MandalFormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('mandals')
    .update({
      name: data.name.trim(),
      area: data.area?.trim() || '',
      description: data.description?.trim() || '',
      image_url: data.image_url?.trim() || '',
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Update mandal error:', error);
    return { error: 'Failed to update mandal.' };
  }

  return { success: true };
}

export async function toggleMandal(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('mandals')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Toggle mandal error:', error);
    return { error: 'Failed to update mandal status.' };
  }

  return { success: true };
}

export async function deleteMandal(id: string) {
  const supabase = await createClient();

  // Check if mandal has reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id')
    .eq('mandal_id', id)
    .limit(1);

  if (reviews && reviews.length > 0) {
    return {
      error: 'Cannot delete a mandal that has reviews. Please disable it instead to preserve historical data.',
    };
  }

  const { error } = await supabase
    .from('mandals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete mandal error:', error);
    return { error: 'Failed to delete mandal.' };
  }

  return { success: true };
}

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) {
    return {
      totalMandals: 0,
      totalReviews: 0,
      overallAverage: 0,
      mostReviewed: null,
    };
  }

  const supabase = await createClient();

  // Get total mandals
  const { count: totalMandals } = await supabase
    .from('mandals')
    .select('*', { count: 'exact', head: true });

  // Get total reviews
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  // Get stats for calculations
  const { data: stats } = await supabase
    .from('mandal_stats')
    .select('*')
    .order('total_reviews', { ascending: false });

  const allStats = stats || [];

  // Overall average rating
  const reviewedMandals = allStats.filter((s) => s.total_reviews > 0);
  const overallAverage =
    reviewedMandals.length > 0
      ? reviewedMandals.reduce((sum, s) => sum + Number(s.average_rating), 0) / reviewedMandals.length
      : 0;

  // Most reviewed mandal
  const mostReviewed = allStats.length > 0 ? allStats[0] : null;

  return {
    totalMandals: totalMandals || 0,
    totalReviews: totalReviews || 0,
    overallAverage: Number(overallAverage.toFixed(2)),
    mostReviewed: mostReviewed
      ? { name: mostReviewed.name, count: mostReviewed.total_reviews }
      : null,
  };
}
