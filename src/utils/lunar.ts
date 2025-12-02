import SunCalc from 'suncalc';
import { DateTime } from 'luxon';
import type { Location, MoonPosition, MoonIllumination, MoonTimes, LunarData, PhaseName } from '../types/lunar';

// Convert radians to degrees
export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

// Convert degrees to radians
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get phase name from phase value (0-1)
export function getPhaseName(phase: number): PhaseName {
  if (phase < 0.0625) return 'Luna Nueva';
  if (phase < 0.1875) return 'Creciente Iluminante';
  if (phase < 0.3125) return 'Cuarto Creciente';
  if (phase < 0.4375) return 'Gibosa Creciente';
  if (phase < 0.5625) return 'Luna Llena';
  if (phase < 0.6875) return 'Gibosa Menguante';
  if (phase < 0.8125) return 'Cuarto Menguante';
  if (phase < 0.9375) return 'Creciente Menguante';
  return 'Luna Nueva';
}

// Get cardinal direction from azimuth
export function getCardinalDirection(azimuth: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(azimuth / 45) % 8;
  return directions[index];
}

// Normalize azimuth to 0-360 range
export function normalizeAzimuth(azimuth: number): number {
  let normalized = azimuth % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

// Calculate moon position
export function getMoonPosition(date: Date, location: Location): MoonPosition {
  const pos = SunCalc.getMoonPosition(date, location.lat, location.lon);
  
  // Convert from radians to degrees
  // SunCalc azimuth is measured from south, clockwise. We need from north.
  let azimuthDeg = radToDeg(pos.azimuth) + 180;
  azimuthDeg = normalizeAzimuth(azimuthDeg);
  
  return {
    altitude: radToDeg(pos.altitude),
    azimuth: azimuthDeg,
    distance: pos.distance,
    parallacticAngle: pos.parallacticAngle,
  };
}

// Calculate moon illumination
export function getMoonIllumination(date: Date): MoonIllumination {
  const illum = SunCalc.getMoonIllumination(date);
  
  return {
    fraction: illum.fraction,
    phase: illum.phase,
    angle: illum.angle,
    phaseName: getPhaseName(illum.phase),
  };
}

// Calculate moon rise/set times
export function getMoonTimes(date: Date, location: Location): MoonTimes {
  const times = SunCalc.getMoonTimes(date, location.lat, location.lon);
  
  return {
    rise: times.rise || null,
    set: times.set || null,
    alwaysUp: times.alwaysUp || false,
    alwaysDown: times.alwaysDown || false,
  };
}

// Calculate all lunar data
export function calculateLunarData(date: Date, location: Location): LunarData {
  return {
    position: getMoonPosition(date, location),
    illumination: getMoonIllumination(date),
    times: getMoonTimes(date, location),
    calculatedAt: new Date(),
  };
}

// Format time with timezone
export function formatTime(date: Date | null, timezone: string): string {
  if (!date) return '--:--';
  
  try {
    return DateTime.fromJSDate(date)
      .setZone(timezone)
      .toFormat('HH:mm');
  } catch {
    return DateTime.fromJSDate(date).toFormat('HH:mm');
  }
}

// Format date
export function formatDate(date: Date, timezone: string): string {
  try {
    return DateTime.fromJSDate(date)
      .setZone(timezone)
      .toFormat('dd/MM/yyyy');
  } catch {
    return DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');
  }
}

// Get timezone offset string
export function getTimezoneOffset(timezone: string): string {
  try {
    const dt = DateTime.now().setZone(timezone);
    const offset = dt.offset;
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return 'UTC';
  }
}

// Get available timezones for a location (approximate)
export function getTimezoneForLocation(lat: number, lon: number): string {
  // Simple approximation based on longitude
  const offset = Math.round(lon / 15);
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
  return `Etc/GMT${offset <= 0 ? '+' : '-'}${Math.abs(offset)}`;
}

// Common timezone list
export const COMMON_TIMEZONES = [
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/London', label: 'Londres (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Mexico_City', label: 'Ciudad de Mexico' },
  { value: 'America/Bogota', label: 'Bogota' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Santiago', label: 'Santiago de Chile' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo' },
  { value: 'Europe/Moscow', label: 'Moscu' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India' },
  { value: 'Asia/Shanghai', label: 'China' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Nueva Zelanda' },
  { value: 'UTC', label: 'UTC' },
];

// Get local timezone
export function getLocalTimezone(): string {
  return DateTime.local().zoneName || 'UTC';
}

// Validate and map timezone to common list
export function validateTimezone(timezone: string): string {
  // Check if timezone exists in common timezones
  const found = COMMON_TIMEZONES.find(tz => tz.value === timezone);
  if (found) return timezone;
  
  // Map common browser timezones to closest match
  const browserTimezone = timezone.toLowerCase();
  
  // Europe mappings
  if (browserTimezone.includes('madrid') || browserTimezone.includes('europe/madrid')) {
    return 'Europe/Madrid';
  }
  if (browserTimezone.includes('london') || browserTimezone.includes('europe/london')) {
    return 'Europe/London';
  }
  if (browserTimezone.includes('paris') || browserTimezone.includes('europe/paris')) {
    return 'Europe/Paris';
  }
  if (browserTimezone.includes('berlin') || browserTimezone.includes('europe/berlin')) {
    return 'Europe/Berlin';
  }
  
  // America mappings
  if (browserTimezone.includes('new york') || browserTimezone.includes('america/new_york') || browserTimezone.includes('est')) {
    return 'America/New_York';
  }
  if (browserTimezone.includes('los angeles') || browserTimezone.includes('america/los_angeles') || browserTimezone.includes('pst')) {
    return 'America/Los_Angeles';
  }
  if (browserTimezone.includes('chicago') || browserTimezone.includes('america/chicago') || browserTimezone.includes('cst')) {
    return 'America/Chicago';
  }
  
  // Default to Madrid if no match found
  return 'Europe/Madrid';
}
