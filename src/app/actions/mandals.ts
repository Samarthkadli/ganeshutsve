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
      .select('id, name, name_en, area')
      .or(`name.ilike.%${q}%,name_en.ilike.%${q}%,area.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(8);

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
    return { stats: [] };
  }

  const supabase = await createClient();

  // 1. Try fetching from mandal_stats view first
  const { data: viewData, error: viewError } = await supabase
    .from('mandal_stats')
    .select('*')
    .order('total_reviews', { ascending: false });

  if (!viewError && viewData && viewData.length > 0) {
    return { stats: viewData };
  }

  // 2. Fallback: Query mandals and reviews directly to compute statistics
  try {
    const { data: mandals } = await supabase.from('mandals').select('*');
    const { data: reviews } = await supabase.from('reviews').select('*');

    if (!mandals) return { stats: [] };

    const reviewsMap = new Map<string, Array<Record<string, unknown>>>();
    (reviews || []).forEach((r) => {
      const existing = reviewsMap.get(r.mandal_id) || [];
      existing.push(r);
      reviewsMap.set(r.mandal_id, existing);
    });

    const calculatedStats: MandalStats[] = mandals.map((m) => {
      const mReviews = reviewsMap.get(m.id) || [];
      const count = mReviews.length;

      const calcAvg = (key: string) => {
        if (count === 0) return 0;
        const sum = mReviews.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
        return +(sum / count).toFixed(2);
      };

      const avgIdol = calcAvg('idol_rating');
      const avgDec = calcAvg('decoration_rating');
      const avgLight = calcAvg('lighting_rating');
      const avgCreat = calcAvg('creativity_rating');
      const avgClean = calcAvg('cleanliness_rating');
      const avgEco = calcAvg('eco_friendly_rating');
      const avgCult = calcAvg('cultural_rating');
      const avgDisc = calcAvg('discipline_rating');
      const avgFac = calcAvg('facilities_rating');
      const avgOver = calcAvg('overall_rating');

      const overallAvg =
        count === 0
          ? 0
          : +((avgIdol + avgDec + avgLight + avgCreat + avgClean + avgEco + avgCult + avgDisc + avgFac + avgOver) / 10).toFixed(2);

      return {
        id: m.id,
        name: m.name,
        area: m.area || '',
        is_active: m.is_active,
        total_reviews: count,
        average_rating: overallAvg,
        avg_idol: avgIdol,
        avg_decoration: avgDec,
        avg_lighting: avgLight,
        avg_creativity: avgCreat,
        avg_cleanliness: avgClean,
        avg_eco_friendly: avgEco,
        avg_cultural: avgCult,
        avg_discipline: avgDisc,
        avg_facilities: avgFac,
        avg_overall: avgOver,
      };
    });

    calculatedStats.sort((a, b) => b.total_reviews - a.total_reviews);
    return { stats: calculatedStats };
  } catch (fallbackErr) {
    console.error('Direct stats calculation error:', fallbackErr);
    return { stats: [] };
  }
}

export async function getMandalDetail(mandalId: string) {
  if (!isSupabaseConfigured()) {
    return { stats: null, reviews: [], error: 'Database not configured.' };
  }

  const supabase = await createClient();

  // 1. Get mandal statistics using getMandalStats
  const { stats: allStats } = await getMandalStats();
  let stats = allStats.find((s) => s.id === mandalId) || null;

  if (!stats) {
    const { data: mandal } = await supabase
      .from('mandals')
      .select('*')
      .eq('id', mandalId)
      .maybeSingle();

    if (mandal) {
      stats = {
        id: mandal.id,
        name: mandal.name,
        area: mandal.area || '',
        is_active: mandal.is_active,
        total_reviews: 0,
        average_rating: 0,
        avg_idol: 0,
        avg_decoration: 0,
        avg_lighting: 0,
        avg_creativity: 0,
        avg_cleanliness: 0,
        avg_eco_friendly: 0,
        avg_cultural: 0,
        avg_discipline: 0,
        avg_facilities: 0,
        avg_overall: 0,
      };
    }
  }

  if (!stats) {
    return { stats: null, reviews: [], error: 'Mandal not found.' };
  }

  // 2. Get individual reviews directly (without schema join errors)
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('mandal_id', mandalId)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews for mandal:', reviewsError);
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

  // Get mandal statistics (using view or direct fallback)
  const { stats } = await getMandalStats();
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
    mostReviewed: mostReviewed && mostReviewed.total_reviews > 0
      ? { name: mostReviewed.name, count: mostReviewed.total_reviews }
      : null,
  };
}
