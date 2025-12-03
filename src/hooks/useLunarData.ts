import { useState, useEffect, useCallback, useRef } from 'react';
import type { Location, LunarData } from '../types/lunar';
import { calculateLunarData, getLocalTimezone, validateTimezone } from '../utils/lunar';
import { saveLocationQuery } from '../services/locationService';

interface UseLunarDataOptions {
  autoUpdate?: boolean;
  updateInterval?: number; // milliseconds
}

interface UseLunarDataReturn {
  lunarData: LunarData | null;
  isLoading: boolean;
  error: string | null;
  location: Location;
  datetime: Date;
  timezone: string;
  isManualDatetime: boolean;
  setLocation: (location: Location) => void;
  setDatetime: (datetime: Date) => void;
  setTimezone: (timezone: string) => void;
  refresh: () => void;
  resumeRealtime: () => void;
}

// Default location: Madrid, Spain
const DEFAULT_LOCATION: Location = {
  lat: 40.4168,
  lon: -3.7038,
  name: 'Madrid, Espana',
};

export function useLunarData(options: UseLunarDataOptions = {}): UseLunarDataReturn {
  const { autoUpdate = true, updateInterval = 60000 } = options;

  const [location, setLocationState] = useState<Location>(DEFAULT_LOCATION);
  const [datetime, setDatetime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(() => validateTimezone(getLocalTimezone()));
  const [lunarData, setLunarData] = useState<LunarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isManualDatetime, setIsManualDatetime] = useState<boolean>(false);
  
  // Track if location was changed by user (not initial load)
  const isUserLocationChange = useRef(false);
  const previousLocation = useRef<Location | null>(null);

  const calculate = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const data = calculateLunarData(datetime, location);
      setLunarData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en calculos');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [datetime, location]);

  // Calculate on mount and when inputs change
  useEffect(() => {
    const data = calculate();
    
    // Save to database when location changes (user action)
    if (isUserLocationChange.current && data && previousLocation.current) {
      // Check if location actually changed
      const locChanged = 
        previousLocation.current.lat !== location.lat || 
        previousLocation.current.lon !== location.lon;
      
      if (locChanged) {
        saveLocationQuery(location, timezone, data).catch(console.error);
      }
    }
    
    previousLocation.current = location;
    isUserLocationChange.current = false;
  }, [calculate, location, timezone]);

  // Custom setLocation that tracks user changes
  const setLocation = useCallback((newLocation: Location) => {
    isUserLocationChange.current = true;
    setLocationState(newLocation);
  }, []);

  // Custom setTimezone with validation
  const setTimezoneWithValidation = useCallback((newTimezone: string) => {
    const validated = validateTimezone(newTimezone);
    setTimezone(validated);
  }, []);

  // Custom setDatetime that marks datetime as manually set
  const setDatetimeManual = useCallback((newDatetime: Date) => {
    setIsManualDatetime(true);
    setDatetime(newDatetime);
  }, []);

  // Resume realtime updates
  const resumeRealtime = useCallback(() => {
    setIsManualDatetime(false);
    setDatetime(new Date());
  }, []);

  // Auto-update interval (paused when datetime is manually set)
  useEffect(() => {
    if (!autoUpdate || isManualDatetime) return;

    const interval = setInterval(() => {
      setDatetime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, isManualDatetime]);

  const refresh = useCallback(() => {
    setDatetime(new Date());
  }, []);

  return {
    lunarData,
    isLoading,
    error,
    location,
    datetime,
    timezone,
    isManualDatetime,
    setLocation,
    setDatetime: setDatetimeManual,
    setTimezone: setTimezoneWithValidation,
    refresh,
    resumeRealtime,
  };
}
