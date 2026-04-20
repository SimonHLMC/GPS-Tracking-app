import React, { useEffect, useState } from 'react';
import { GpsPoint } from '../utils/storage';
import './GpsTracker.css';

interface GpsTrackerProps {
  onLocationUpdate: (point: GpsPoint) => void;
  isTracking: boolean;
}

export const GpsTracker: React.FC<GpsTrackerProps> = ({ onLocationUpdate, isTracking }) => {
  const [currentPosition, setCurrentPosition] = useState<GpsPoint | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      setError('Geolocation wird von diesem Browser nicht unterstützt');
      return;
    }

    // Initiale Position abrufen
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };
        setCurrentPosition(point);
        setAccuracy(position.coords.accuracy);
        onLocationUpdate(point);
        setError(null);
      },
      (err) => {
        setError(`Fehler bei Geolocation: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Position alle 10 Sekunden aktualisieren
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const point: GpsPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };
        setCurrentPosition(point);
        setAccuracy(position.coords.accuracy);
        onLocationUpdate(point);
        setError(null);
      },
      (err) => {
        console.error('Watch Position Error:', err);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, onLocationUpdate]);

  return (
    <div className="gps-tracker">
      {error && <div className="error-message">{error}</div>}
      {currentPosition && (
        <div className="position-info">
          <p>📍 Breite: {currentPosition.lat.toFixed(6)}</p>
          <p>📍 Länge: {currentPosition.lng.toFixed(6)}</p>
          {accuracy && <p>📊 Genauigkeit: ±{accuracy.toFixed(0)}m</p>}
        </div>
      )}
      {isTracking && <div className="tracking-indicator">🔴 GPS wird aufgezeichnet</div>}
    </div>
  );
};

export default GpsTracker;
