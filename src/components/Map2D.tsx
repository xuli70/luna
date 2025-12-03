import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import type { Location, MoonPosition } from '../types/lunar';

interface Map2DProps {
  location: Location;
  moonPosition: MoonPosition | null;
  onLocationChange: (location: Location) => void;
}

export default function Map2D({ location, moonPosition, onLocationChange }: Map2DProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const arrowRef = useRef<L.Polyline | null>(null);
  const arrowHeadRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create custom marker icon
  const createMarkerIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #00d4ff;
          border: 3px solid #0a0a0f;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(0,212,255,0.5);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Create map with dark theme
    mapRef.current = L.map(containerRef.current, {
      center: [location.lat, location.lon],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    // Add dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Add marker
    markerRef.current = L.marker([location.lat, location.lon], {
      icon: createMarkerIcon(),
      draggable: true,
    }).addTo(mapRef.current);

    // Handle marker drag
    markerRef.current.on('dragend', async (e) => {
      const marker = e.target;
      const pos = marker.getLatLng();
      
      // Reverse geocode to get name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`,
          { headers: { 'User-Agent': 'LunarPositionApp/1.0' } }
        );
        const data = await response.json();
        const name = data.display_name?.split(',').slice(0, 2).join(',') || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
        onLocationChange({ lat: pos.lat, lon: pos.lng, name });
      } catch {
        onLocationChange({ lat: pos.lat, lon: pos.lng, name: `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` });
      }
    });

    // Handle map click
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      // Reverse geocode to get name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'User-Agent': 'LunarPositionApp/1.0' } }
        );
        const data = await response.json();
        const name = data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onLocationChange({ lat, lon: lng, name });
      } catch {
        onLocationChange({ lat, lon: lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lon]);
      mapRef.current.setView([location.lat, location.lon], mapRef.current.getZoom());
    }
  }, [location]);

  // Update arrow direction when moon position changes
  useEffect(() => {
    if (!mapRef.current || !moonPosition) return;

    // Remove existing arrow and arrowhead
    if (arrowRef.current) {
      arrowRef.current.remove();
      arrowRef.current = null;
    }
    if (arrowHeadRef.current) {
      arrowHeadRef.current.remove();
      arrowHeadRef.current = null;
    }

    // Only show arrow if moon is above horizon
    if (moonPosition.altitude < 0) {
      return;
    }

    // Calculate endpoint for the arrow (in map coordinates)
    const arrowLength = 0.5; // degrees
    const azimuthRad = (moonPosition.azimuth * Math.PI) / 180;
    
    const endLat = location.lat + arrowLength * Math.cos(azimuthRad);
    const endLon = location.lon + arrowLength * Math.sin(azimuthRad);

    // Create arrow polyline
    arrowRef.current = L.polyline(
      [
        [location.lat, location.lon],
        [endLat, endLon],
      ],
      {
        color: '#ffb800',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
      }
    ).addTo(mapRef.current);

    // Add arrowhead
    const arrowHead = L.divIcon({
      className: 'arrow-head',
      html: `
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 16px solid #ffb800;
          transform: rotate(${moonPosition.azimuth}deg);
          filter: drop-shadow(0 0 8px rgba(255,184,0,0.5));
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    arrowHeadRef.current = L.marker([endLat, endLon], { icon: arrowHead }).addTo(mapRef.current);

  }, [moonPosition, location]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-border-default"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-bg-overlay backdrop-blur-sm rounded-lg p-3 border border-border-subtle">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-primary" />
            <span className="text-body-sm text-text-secondary">Tu ubicacion</span>
          </div>
          {moonPosition && moonPosition.altitude > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-accent-secondary" />
              <span className="text-body-sm text-text-secondary">Direccion Luna</span>
            </div>
          )}
        </div>
      </div>

      {/* Info overlay */}
      {moonPosition && moonPosition.altitude <= 0 && (
        <div className="absolute top-4 right-4 bg-bg-overlay backdrop-blur-sm rounded-lg px-4 py-2 border border-border-subtle">
          <p className="text-body-sm text-warning">La Luna esta bajo el horizonte</p>
        </div>
      )}
    </div>
  );
}
