import { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, Globe, Loader2 } from 'lucide-react';
import { DateTime } from 'luxon';
import type { Location } from '../types/lunar';
import { geocodeAddress, parseCoordinates, getCurrentPosition } from '../utils/geocoding';
import { COMMON_TIMEZONES, getLocalTimezone, validateTimezone } from '../utils/lunar';

interface ControlsProps {
  location: Location;
  datetime: Date;
  timezone: string;
  onLocationChange: (location: Location) => void;
  onDatetimeChange: (datetime: Date) => void;
  onTimezoneChange: (timezone: string) => void;
}

export default function Controls({
  location,
  datetime,
  timezone,
  onLocationChange,
  onDatetimeChange,
  onTimezoneChange,
}: ControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Format datetime for inputs
  const dateValue = DateTime.fromJSDate(datetime).setZone(timezone).toFormat('yyyy-MM-dd');
  const timeValue = DateTime.fromJSDate(datetime).setZone(timezone).toFormat('HH:mm');

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // First, check if it's coordinates
    const coords = parseCoordinates(searchQuery);
    if (coords) {
      setSearchResults([coords]);
      setShowResults(true);
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (searchQuery.length < 3) return;
      
      setIsSearching(true);
      try {
        const results = await geocodeAddress(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectLocation = useCallback((loc: Location) => {
    onLocationChange(loc);
    setSearchQuery(loc.name || '');
    setShowResults(false);
    setSearchResults([]);
  }, [onLocationChange]);

  const handleGetCurrentLocation = useCallback(async () => {
    setIsGeolocating(true);
    try {
      const loc = await getCurrentPosition();
      onLocationChange(loc);
      setSearchQuery(loc.name || '');
      // Auto-detect timezone based on browser
      onTimezoneChange(validateTimezone(getLocalTimezone()));
    } catch (error) {
      console.error('Geolocation error:', error);
    } finally {
      setIsGeolocating(false);
    }
  }, [onLocationChange, onTimezoneChange]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = DateTime.fromFormat(
      `${e.target.value} ${timeValue}`,
      'yyyy-MM-dd HH:mm',
      { zone: timezone }
    ).toJSDate();
    onDatetimeChange(newDate);
  }, [timeValue, timezone, onDatetimeChange]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = DateTime.fromFormat(
      `${dateValue} ${e.target.value}`,
      'yyyy-MM-dd HH:mm',
      { zone: timezone }
    ).toJSDate();
    onDatetimeChange(newDate);
  }, [dateValue, timezone, onDatetimeChange]);

  const handleUseNow = useCallback(() => {
    onDatetimeChange(new Date());
  }, [onDatetimeChange]);

  return (
    <section id="controles" className="scroll-mt-20">
      <div className="bg-bg-elevated rounded-xl border border-border-default p-6 shadow-card">
        <h2 className="font-display text-heading-lg text-text-primary mb-6">
          Configuracion
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Search */}
          <div className="lg:col-span-2">
            <label className="block text-body-sm text-text-secondary mb-2">
              Ubicacion
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Buscar ciudad, direccion o coordenadas (ej: 40.7128, -74.0060)"
                className="w-full h-14 pl-12 pr-4 bg-bg-interactive border border-border-default rounded-lg text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-accent focus:ring-2 focus:ring-accent-primary/20 transition-all"
              />
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border-default rounded-lg shadow-card overflow-hidden z-10">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full px-4 py-3 text-left hover:bg-bg-interactive transition-colors border-b border-border-subtle last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-accent-primary flex-shrink-0" />
                        <div>
                          <p className="text-body-sm text-text-primary truncate">
                            {result.name}
                          </p>
                          <p className="text-body-sm text-text-tertiary">
                            {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Current location button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={isGeolocating}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-body-sm text-accent-primary hover:text-accent-primary-hover transition-colors disabled:opacity-50"
            >
              {isGeolocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Usar mi ubicacion actual
            </button>

            {/* Current location display */}
            <div className="mt-3 px-4 py-3 bg-bg-primary rounded-lg border border-border-subtle">
              <p className="text-body-sm text-text-secondary">Ubicacion actual:</p>
              <p className="text-body-md text-text-primary">{location.name || 'No seleccionada'}</p>
              <p className="text-body-sm text-text-tertiary font-mono">
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-body-sm text-text-secondary mb-2">
              Fecha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={dateValue}
                onChange={handleDateChange}
                className="w-full h-12 pl-12 pr-4 bg-bg-interactive border border-border-default rounded-lg text-body-md text-text-primary focus:outline-none focus:border-border-accent focus:ring-2 focus:ring-accent-primary/20 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-body-sm text-text-secondary mb-2">
              Hora
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Clock className="w-5 h-5" />
              </div>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-full h-12 pl-12 pr-4 bg-bg-interactive border border-border-default rounded-lg text-body-md text-text-primary focus:outline-none focus:border-border-accent focus:ring-2 focus:ring-accent-primary/20 transition-all [color-scheme:dark]"
              />
            </div>
            <button
              onClick={handleUseNow}
              className="mt-2 text-body-sm text-accent-primary hover:text-accent-primary-hover transition-colors"
            >
              Usar hora actual
            </button>
          </div>

          {/* Timezone Selector */}
          <div className="lg:col-span-2">
            <label className="block text-body-sm text-text-secondary mb-2">
              Zona Horaria
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Globe className="w-5 h-5" />
              </div>
              <select
                value={timezone}
                onChange={(e) => onTimezoneChange(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-bg-interactive border border-border-default rounded-lg text-body-md text-text-primary focus:outline-none focus:border-border-accent focus:ring-2 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
