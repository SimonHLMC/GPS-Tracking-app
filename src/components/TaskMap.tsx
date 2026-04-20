import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { GpsPoint } from '../utils/storage';
import './TaskMap.css';

interface TaskMapProps {
  points: GpsPoint[];
  taskName: string;
  currentPosition?: GpsPoint;
}

// Berechne Winkel zwischen zwei Punkten
const calculateBearing = (from: [number, number], to: [number, number]): number => {
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const deltaLng = ((to[1] - from[1]) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  const bearing = Math.atan2(y, x);

  return ((bearing * 180) / Math.PI + 360) % 360;
};

// Berechne Mittelpunkt zwischen zwei Punkten
const getMidpoint = (from: [number, number], to: [number, number]): [number, number] => {
  return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
};

export const TaskMap: React.FC<TaskMapProps> = ({ points, taskName, currentPosition }) => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<L.Map | null>(null);
  const polyline = React.useRef<L.Polyline | null>(null);
  const currentMarker = React.useRef<L.Marker | null>(null);
  const arrowsGroup = React.useRef<L.FeatureGroup | null>(null);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialisiere Karte
    map.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);
    
    // Erstelle FeatureGroup für Pfeile
    arrowsGroup.current = L.featureGroup().addTo(map.current);
    
    // Standardlayer
    tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);
  }, []);

  // Wechsle Map-Type
  useEffect(() => {
    if (!map.current || !tileLayerRef.current) return;

    map.current.removeLayer(tileLayerRef.current);

    if (mapType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '© Esri',
          maxZoom: 19,
        }
      ).addTo(map.current);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map.current);
    }
  }, [mapType]);

  // Update Route mit Pfeilen
  useEffect(() => {
    if (!map.current || points.length === 0) return;

    // Entferne alte Polyline
    if (polyline.current) {
      map.current.removeLayer(polyline.current);
    }

    // Leere alte Pfeile
    if (arrowsGroup.current) {
      arrowsGroup.current.clearLayers();
    }

    const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);

    // Zeichne neue Polyline
    polyline.current = L.polyline(latlngs, { color: 'blue', weight: 3 }).addTo(map.current);

    // Zeichne Pfeile zwischen Punkten
    if (points.length > 1 && arrowsGroup.current) {
      for (let i = 0; i < points.length - 1; i++) {
        const from: [number, number] = [points[i].lat, points[i].lng];
        const to: [number, number] = [points[i + 1].lat, points[i + 1].lng];

        // Berechne Winkel
        const bearing = calculateBearing(from, to);

        // Berechne Position für Pfeil (Mittelpunkt)
        const midpoint = getMidpoint(from, to);

        // Erstelle Arrow-Icon
        const arrowIcon = L.divIcon({
          html: `<div class="arrow-marker" style="transform: rotate(${bearing}deg);">➤</div>`,
          iconSize: [20, 20],
          className: 'arrow-icon',
        });

        L.marker(midpoint, { icon: arrowIcon }).addTo(arrowsGroup.current);
      }
    }

    // Markiere Start- und Endpunkte
    if (points.length > 0) {
      const startPoint = points[0];
      L.circleMarker([startPoint.lat, startPoint.lng], {
        radius: 8,
        fillColor: '#00AA00',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup('🟢 Start')
        .addTo(map.current);

      const endPoint = points[points.length - 1];
      L.circleMarker([endPoint.lat, endPoint.lng], {
        radius: 8,
        fillColor: '#FF0000',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup('🔴 Ende')
        .addTo(map.current);
    }

    // Fit bounds
    map.current.fitBounds(polyline.current.getBounds(), { padding: [50, 50] });
  }, [points]);

  // Update Live Position
  useEffect(() => {
    if (!map.current || !currentPosition) return;

    if (currentMarker.current) {
      map.current.removeLayer(currentMarker.current);
    }

    // Erstelle Pulsing Marker für aktuelle Position
    const pulsingIcon = L.divIcon({
      html: `<div class="pulsing-marker"></div>`,
      iconSize: [20, 20],
      className: 'custom-marker',
    });

    currentMarker.current = L.marker([currentPosition.lat, currentPosition.lng], {
      icon: pulsingIcon,
    })
      .bindPopup('📍 Aktuelle Position')
      .addTo(map.current);
  }, [currentPosition]);

  return (
    <div className="task-map-container">
      <div className="map-header">
        <h3>{taskName}</h3>
        <div className="map-controls">
          <button
            className={`map-btn ${mapType === 'osm' ? 'active' : ''}`}
            onClick={() => setMapType('osm')}
          >
            🗺️ Karte
          </button>
          <button
            className={`map-btn ${mapType === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapType('satellite')}
          >
            🛰️ Satellit
          </button>
        </div>
      </div>
      <div className="map-info">
        Punkte erfasst: <strong>{points.length}</strong>
        {currentPosition && (
          <span className="live-indicator">
            🔴 Live: {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
          </span>
        )}
      </div>
      <div ref={mapContainer} className="task-map" />
    </div>
  );
};

export default TaskMap;
