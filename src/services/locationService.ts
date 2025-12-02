import { supabase, isSupabaseConfigured, type LocationQuery } from '../lib/supabase';
import type { Location, LunarData } from '../types/lunar';

// Service for storing and retrieving location queries

/**
 * Save a location query to the database
 */
export async function saveLocationQuery(
  location: Location,
  timezone: string,
  lunarData: LunarData
): Promise<{ success: boolean; error?: string }> {
  // Skip if Supabase is not configured
  if (!isSupabaseConfigured() || !supabase) {
    console.log('Supabase not configured - location query not saved');
    return { success: true };
  }

  try {
    const queryData: Omit<LocationQuery, 'id'> = {
      lat: location.lat,
      lon: location.lon,
      name: location.name || null,
      timezone: timezone,
      queried_at: new Date().toISOString(),
      moon_altitude: lunarData.position.altitude,
      moon_azimuth: lunarData.position.azimuth,
      moon_phase: lunarData.illumination.phaseName,
      moon_illumination: lunarData.illumination.fraction,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    const { error } = await supabase
      .from('location_queries')
      .insert([queryData]);

    if (error) {
      console.error('Error saving location query:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error saving location query:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get recent location queries (optional - for analytics)
 */
export async function getRecentQueries(limit: number = 10): Promise<LocationQuery[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('location_queries')
      .select('*')
      .order('queried_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent queries:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching recent queries:', err);
    return [];
  }
}

/**
 * Get query count (optional - for analytics)
 */
export async function getQueryCount(): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from('location_queries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching query count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error fetching query count:', err);
    return 0;
  }
}
