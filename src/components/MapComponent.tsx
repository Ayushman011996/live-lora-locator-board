
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  isConnected: boolean;
}

export const MapComponent = ({ latitude, longitude, isConnected }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [40.7128, -74.0060], // Default to NYC
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add scale control
      L.control.scale().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    const newPosition: L.LatLngExpression = [latitude, longitude];

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(newPosition);
    } else {
      // Create custom icon based on connection status
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="w-4 h-4 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } border-2 border-white shadow-lg animate-pulse"></div>
            <div class="absolute -top-1 -left-1 w-6 h-6 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } opacity-25 animate-ping"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      markerRef.current = L.marker(newPosition, { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(
          `<div class="text-center">
            <strong>ESP32 Device</strong><br>
            <small>Lat: ${latitude.toFixed(6)}</small><br>
            <small>Lng: ${longitude.toFixed(6)}</small><br>
            <small>Status: ${isConnected ? 'Connected' : 'Disconnected'}</small>
          </div>`
        );
    }

    // Center map on new position
    mapRef.current.setView(newPosition, 15, { animate: true });
  }, [latitude, longitude, isConnected]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      {!latitude && !longitude && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Waiting for GPS data...</p>
          </div>
        </div>
      )}
    </div>
  );
};
