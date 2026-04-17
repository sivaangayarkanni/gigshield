import React, { useEffect, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

const LiveLocationDisplay = ({ compact = false }) => {
  const { riderCoords, activeCity, lastLocationUpdate, geoError } = useSimulation();
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAccuracy(position.coords.accuracy);
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  }, [riderCoords]);

  if (geoError) {
    return (
      <div className="location-display error">
        <MapPin size={16} />
        <span>Location unavailable: {geoError}</span>
      </div>
    );
  }

  if (!riderCoords || riderCoords[0] === 28.6139) {
    return (
      <div className="location-display loading">
        <RefreshCw size={16} className="animate-spin" />
        <span>Getting your location...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="location-display compact">
        <MapPin size={14} className="text-green-400" />
        <span>{activeCity}</span>
        <span className="coords">
          {riderCoords[0].toFixed(4)}°, {riderCoords[1].toFixed(4)}°
        </span>
      </div>
    );
  }

  return (
    <div className="location-display full">
      <div className="location-header">
        <div className="header-left">
          <Navigation size={20} className="text-green-400 pulse" />
          <h3>Live Location</h3>
        </div>
        <span className="live-badge">🔴 LIVE</span>
      </div>

      <div className="location-details">
        <div className="detail-row">
          <span className="label">City:</span>
          <span className="value">{activeCity}</span>
        </div>
        <div className="detail-row">
          <span className="label">Latitude:</span>
          <span className="value">{riderCoords[0].toFixed(6)}°N</span>
        </div>
        <div className="detail-row">
          <span className="label">Longitude:</span>
          <span className="value">{riderCoords[1].toFixed(6)}°E</span>
        </div>
        {accuracy && (
          <div className="detail-row">
            <span className="label">Accuracy:</span>
            <span className="value">±{Math.round(accuracy)}m</span>
          </div>
        )}
        {lastLocationUpdate && (
          <div className="detail-row">
            <span className="label">Updated:</span>
            <span className="value">
              {new Date(lastLocationUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="location-map-link">
        <a
          href={`https://www.google.com/maps?q=${riderCoords[0]},${riderCoords[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-button"
        >
          <MapPin size={16} />
          View on Google Maps
        </a>
      </div>

      <style jsx>{`
        .location-display {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 1rem;
          backdrop-filter: blur(10px);
        }

        .location-display.compact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }

        .location-display.compact .coords {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        .location-display.error {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .location-display.loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-left h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .live-badge {
          padding: 0.25rem 0.5rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #ef4444;
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .location-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }

        .detail-row .label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .detail-row .value {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          font-family: 'Courier New', monospace;
        }

        .location-map-link {
          margin-top: 1rem;
        }

        .map-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .map-button:hover {
          transform: scale(1.02);
        }

        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LiveLocationDisplay;
