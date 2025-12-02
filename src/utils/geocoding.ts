import type { Location } from '../types/lunar';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

// Nominatim geocoding API (OpenStreetMap)
export async function geocodeAddress(query: string): Promise<Location[]> {
  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LunarPositionApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error en geocodificacion');
    }

    const results: NominatimResult[] = await response.json();
    
    return results.map((result) => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.display_name,
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Reverse geocoding (coordinates to address)
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LunarPositionApp/1.0',
        },
      }
    );

    if (!response.ok) {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }

    const result: NominatimResult = await response.json();
    
    // Build a short name
    const address = result.address;
    if (address) {
      const city = address.city || address.town || address.village || '';
      const country = address.country || '';
      if (city && country) {
        return `${city}, ${country}`;
      }
      return city || country || result.display_name.split(',').slice(0, 2).join(',');
    }
    
    return result.display_name.split(',').slice(0, 2).join(',');
  } catch (error) {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

// Parse coordinates from string (supports multiple formats)
export function parseCoordinates(input: string): Location | null {
  // Remove extra spaces
  const cleaned = input.trim().replace(/\s+/g, ' ');
  
  // Try different formats
  
  // Format: 40.7128, -74.0060 or 40.7128 -74.0060
  const commaFormat = cleaned.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (commaFormat) {
    const lat = parseFloat(commaFormat[1]);
    const lon = parseFloat(commaFormat[2]);
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
    }
  }
  
  // Format with N/S/E/W: 40.7128N 74.0060W
  const dmsFormat = cleaned.match(/(\d+\.?\d*)\s*([NS])[,\s]+(\d+\.?\d*)\s*([EWO])/i);
  if (dmsFormat) {
    let lat = parseFloat(dmsFormat[1]);
    let lon = parseFloat(dmsFormat[3]);
    if (dmsFormat[2].toUpperCase() === 'S') lat = -lat;
    if (dmsFormat[4].toUpperCase() === 'W' || dmsFormat[4].toUpperCase() === 'O') lon = -lon;
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon, name: `${lat.toFixed(4)}, ${lon.toFixed(4)}` };
    }
  }
  
  return null;
}

// Validate coordinate ranges
export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// Get user's current location
export function getCurrentPosition(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalizacion no disponible en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const name = await reverseGeocode(lat, lon);
        resolve({ lat, lon, name });
      },
      (error) => {
        let message = 'Error al obtener ubicacion';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicacion denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Ubicacion no disponible';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
