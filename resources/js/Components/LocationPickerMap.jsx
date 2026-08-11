import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass } from 'lucide-react';

// Fix default Leaflet marker icon paths when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationPickerMap({ latitude, longitude, radiusMeters = 100, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const initialLat = latitude || -6.2088;
  const initialLng = longitude || 106.8456;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

      const circle = L.circle([initialLat, initialLng], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        radius: radiusMeters,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        circle.setLatLng([lat, lng]);
        onChange({ latitude: lat, longitude: lng });
      });

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        onChange({ latitude: lat, longitude: lng });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view & marker when lat/lng props change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      if (latitude && longitude) {
        const latLng = [latitude, longitude];
        markerRef.current.setLatLng(latLng);
        circleRef.current.setLatLng(latLng);
        mapInstanceRef.current.panTo(latLng);
      }
    }
  }, [latitude, longitude]);

  // Update radius circle when radiusMeters prop changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters || 100);
    }
  }, [radiusMeters]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          if (mapInstanceRef.current && markerRef.current && circleRef.current) {
            mapInstanceRef.current.setView([lat, lng], 17);
            markerRef.current.setLatLng([lat, lng]);
            circleRef.current.setLatLng([lat, lng]);
          }
          onChange({ latitude: lat, longitude: lng });
          setGpsLoading(false);
        },
        (error) => {
          console.error('Terjadi Kesalahan getting location:', error);
          alert('Gagal mengambil lokasi GPS. Pastikan izin lokasi browser telah diaktifkan.');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-extrabold uppercase text-slate-700">
          Peta Lokasi (Klik atau geser pin untuk menentukan titik koordinat)
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gpsLoading}
          className="text-xs font-extrabold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-xl border border-brand-200 transition flex items-center gap-1.5 active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{gpsLoading ? 'Memuat GPS...' : 'Ambil Lokasi Saya'}</span>
        </button>
      </div>

      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-blue-500" /> Powered by <b>OpenStreetMap</b> (Gratis & Realtime)
        </span>
        <span className="font-mono font-bold text-slate-700">
          Lat: {latitude ? latitude.toFixed(6) : '-'}, Lng: {longitude ? longitude.toFixed(6) : '-'}
        </span>
      </div>
    </div>
  );
}
