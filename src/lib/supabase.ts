import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - will be provided via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client (only if configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Type definitions for our database tables
export interface LocationQuery {
  id?: string;
  lat: number;
  lon: number;
  name: string | null;
  timezone: string;
  queried_at: string;
  moon_altitude: number;
  moon_azimuth: number;
  moon_phase: string;
  moon_illumination: number;
  user_agent?: string;
}

export default supabase;
