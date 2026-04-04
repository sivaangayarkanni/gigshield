import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSimulation } from '../../context/SimulationContext';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const riderIcon = L.divIcon({
  className: 'custom-rider-icon',
  html: `<div style='background-color:#FB923C; width:16px; height:16px; border-radius:50%; border:3px solid #0F172A; box-shadow:0 0 15px #FB923C; border-collapse: separate;'></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const hazardIcon = (color) => L.divIcon({
  className: 'custom-hazard-icon',
  html: `<div style='background-color:${color}; width:12px; height:12px; border-radius:50%; border:2px solid #0F172A; box-shadow: 0 0 10px ${color}; animation: pulseGlow 2s infinite;'></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const MapCenterController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const NationalRiskMap = ({ height = "100%", showRider = true }) => {
  const { activeCity, riderCoords } = useSimulation();

  const cityCoords = useMemo(() => ({
    'Delhi NCR': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714]
  }), []);

  const mapCenter = cityCoords[activeCity] || [20.5937, 78.9629];
  const zoom = cityCoords[activeCity] ? 12 : 5;

  const hazards = [
    { id: 'h1', pos: [28.68, 77.20], type: 'AQI', color: '#FBBF24', val: 'AQI: 382' },
    { id: 'h2', pos: [19.12, 72.90], type: 'RAIN', color: '#60A5FA', val: 'HEAVY RAIN' },
    { id: 'h3', pos: [13.00, 80.25], type: 'RAIN', color: '#60A5FA', val: 'WATERLOGGING' },
    { id: 'h4', pos: [12.95, 77.62], type: 'GRIDLOCK', color: '#F87171', val: 'GRIDLOCK' }
  ];

  return (
    <div style={{ height, minHeight: '500px', width: '100%', position: 'relative' }} className="map-dark-container">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0F172A', position: 'absolute', inset: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        
        <MapCenterController center={mapCenter} />

        {hazards.map(h => (
          <React.Fragment key={h.id}>
             <Circle center={h.pos} radius={3000} pathOptions={{ color: h.color, fillColor: h.color, fillOpacity: 0.1, weight: 1, dashArray: '5, 10' }} />
             <Marker position={h.pos} icon={hazardIcon(h.color)}>
                <Popup className="dark-popup"><div className="font-extrabold">{h.val}</div></Popup>
             </Marker>
          </React.Fragment>
        ))}

        {showRider && (
          <Marker position={riderCoords} icon={riderIcon}>
            <Popup className="dark-popup">
              <div className="font-bold text-slate-800">Your Live Position</div>
              <div className="text-xs text-slate-500">
                {riderCoords[0].toFixed(4)}, {riderCoords[1].toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
         <div className="glass-panel p-2 px-4 shadow-[0_0_20px_rgba(251,146,60,0.1)] text-[10px] font-black flex items-center gap-2 border-orange-500/20 bg-slate-900/80">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> TELEMETRY ACTIVE
         </div>
      </div>
    </div>
  );
};

export default NationalRiskMap;