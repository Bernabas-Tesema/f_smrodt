import React, { useState } from 'react';
import { Vehicle, Geofence } from '../types/smrod';
import { Navigation, ShieldAlert, CheckCircle, Car, MapPin, ZoomIn, ZoomOut, RotateCcw, Eye, Radio } from 'lucide-react';

interface InteractiveMapProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
  showControls?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  vehicles,
  geofences,
  selectedVehicleId,
  onSelectVehicle,
  className = '',
  showControls = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);

  // Map coordinate conversion for Nairobi area (-1.22 to -1.36 lat, 36.75 to 36.95 lng)
  const minLat = -1.37;
  const maxLat = -1.21;
  const minLng = 36.76;
  const maxLng = 36.93;

  const getSvgCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800;
    // latitude is inverted on screen (more negative is lower/south)
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520;
    return { x: Math.max(30, Math.min(770, x)), y: Math.max(30, Math.min(490, y)) };
  };

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden select-none ${className}`}>
      {/* Top Map Status Kicker & Legend */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">GNSS Live Telemetry</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-400 font-mono tabular-nums">{vehicles.length} Pilot Units</span>
      </div>

      {/* Floating Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Map"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-800 my-auto mx-0.5" />
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
              showGeofences ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Geofences
          </button>
        </div>
      )}

      {/* Interactive SVG Vector Map Viewport */}
      <div className="w-full h-full min-h-[420px] overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Map Grid Lines & Radar concentric rings */}
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.7" opacity="0.6" />
            </pattern>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#312e81" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base Canvas */}
          <rect width="800" height="520" fill="#090d16" />
          <rect width="800" height="520" fill="url(#mapGrid)" />
          <circle cx="400" cy="260" r="320" fill="url(#radarGlow)" />
          <circle cx="400" cy="260" r="160" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx="400" cy="260" r="280" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="4 4" />

          {/* Major Road Arteries (Mombasa Rd, Uhuru Hwy, Thika Rd, Southern Bypass) */}
          <path
            d="M 120 480 Q 280 340 400 260 T 680 70"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 120 480 Q 280 340 400 260 T 680 70"
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />
          <path
            d="M 80 180 Q 260 220 400 260 T 720 380"
            fill="none"
            stroke="#334155"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 280 40 L 320 220 L 400 260 L 450 490"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <path
            d="M 160 380 Q 340 460 620 440"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Location Area Labels */}
          <text x="360" y="240" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600">
            CBD / CENTRAL SECTOR
          </text>
          <text x="610" y="320" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="500">
            JKIA Logistics Zone
          </text>
          <text x="140" y="210" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="500">
            Westlands Tech Hub
          </text>
          <text x="460" y="440" fill="#475569" fontSize="10" fontFamily="sans-serif" fontWeight="500">
            Industrial Park Corridor
          </text>

          {/* Render Geofences */}
          {showGeofences &&
            geofences.map((geo) => {
              const { x, y } = getSvgCoordinates(geo.centerLat, geo.centerLng);
              const radiusSvg = (geo.radiusMeters || 2000) / 28;
              return (
                <g key={geo.id} className="transition-opacity">
                  <circle
                    cx={x}
                    cy={y}
                    r={radiusSvg}
                    fill="#3b82f6"
                    fillOpacity="0.08"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x}
                    y={y - radiusSvg - 6}
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="9.5"
                    fontWeight="500"
                    fontFamily="sans-serif"
                  >
                    ZONE: {geo.name}
                  </text>
                </g>
              );
            })}

          {/* Breadcrumb historical path for selected vehicle */}
          {showBreadcrumbs && selectedVehicleId && (
            (() => {
              const sel = vehicles.find((v) => v.id === selectedVehicleId);
              if (!sel) return null;
              const { x, y } = getSvgCoordinates(sel.latitude, sel.longitude);
              return (
                <g>
                  <path
                    d={`M ${x - 45} ${y + 25} L ${x - 20} ${y + 10} L ${x} ${y}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle cx={x - 45} cy={y + 25} r="2.5" fill="#818cf8" opacity="0.6" />
                  <circle cx={x - 20} cy={y + 10} r="3" fill="#818cf8" opacity="0.8" />
                </g>
              );
            })()
          )}

          {/* Render Pilot Vehicles */}
          {vehicles.map((v) => {
            const { x, y } = getSvgCoordinates(v.latitude, v.longitude);
            const isSelected = v.id === selectedVehicleId;
            const isCritical = v.securityStatus === 'critical';
            const isWarning = v.securityStatus === 'warning';

            return (
              <g
                key={v.id}
                onClick={() => onSelectVehicle?.(v)}
                className="cursor-pointer group"
                transform={`translate(${x}, ${y})`}
              >
                {/* Ping Radiation Ripple for Alerts or Moving Vehicles */}
                {(isCritical || isWarning || v.currentSpeed > 0) && (
                  <circle
                    r={isSelected ? 26 : 18}
                    fill="none"
                    stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1"
                    opacity="0.4"
                    className="animate-ping"
                  />
                )}

                {/* Marker Outer Shell */}
                <circle
                  r={isSelected ? 16 : 12}
                  fill={
                    isCritical
                      ? '#7f1d1d'
                      : isWarning
                      ? '#78350f'
                      : v.isImmobilized
                      ? '#312e81'
                      : '#0f172a'
                  }
                  stroke={
                    isSelected
                      ? '#6366f1'
                      : isCritical
                      ? '#ef4444'
                      : isWarning
                      ? '#f59e0b'
                      : '#38bdf8'
                  }
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Directional Heading Pointer */}
                <g transform={`rotate(${v.heading})`}>
                  <polygon
                    points="0,-8 4,4 0,2 -4,4"
                    fill={isCritical ? '#fca5a5' : isWarning ? '#fde68a' : '#bae6fd'}
                  />
                </g>

                {/* Plate label badge */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-34"
                    y="-9"
                    width="68"
                    height="18"
                    rx="4"
                    fill="#020617"
                    stroke={isSelected ? '#6366f1' : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {v.plateNumber}
                  </text>
                </g>

                {/* Speed tag when moving */}
                {v.currentSpeed > 0 && (
                  <text
                    x="24"
                    y="-4"
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {v.currentSpeed} km/h
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom map metadata bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Normal Fleet ({vehicles.filter(v => v.securityStatus === 'normal').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Warning ({vehicles.filter(v => v.securityStatus === 'warning').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-slate-300">Critical ({vehicles.filter(v => v.securityStatus === 'critical').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-slate-300">Immobilized ({vehicles.filter(v => v.isImmobilized).length})</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Nairobi Operational Pilot Sector (ESP32-S3 + LTE / GNSS)
        </div>
      </div>
    </div>
  );
};
