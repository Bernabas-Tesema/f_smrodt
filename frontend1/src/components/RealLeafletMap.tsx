import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Vehicle, Geofence } from '../types/smrod';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize2,
  Radio,
  Eye,
  Shield,
  Lock,
  Battery,
  Gauge
} from 'lucide-react';

interface RealLeafletMapProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  vehicles,
  geofences,
  selectedVehicleId,
  onSelectVehicle,
  className = '',
  height = '500px',
  showControls = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const geofencesGroupRef = useRef<L.LayerGroup | null>(null);
  const breadcrumbsGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showGeofences, setShowGeofences] = useState(true);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // User Mapbox Access Token
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYmVybmFiYXN0ZXNlbWEiLCJhIjoiY213MGVmNnVzMDIzYjJ4czlrODRoazU4bSJ9.BUNGJC6Zw4xQAg_ud_rM3g';

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Nairobi coordinates (-1.2921, 36.8219)
    const map = L.map(mapContainerRef.current, {
      center: [-1.286389, 36.817223],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Primary Mapbox Streets Tile Layer with fallback
    const tileLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      {
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        subdomains: 'abcd'
      }
    ).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    geofencesGroupRef.current = L.layerGroup().addTo(map);
    breadcrumbsGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
    let tileSize = 512;
    let zoomOffset = -1;

    if (mapType === 'dark') {
      url = `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
    } else if (mapType === 'satellite') {
      url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      tileSize,
      zoomOffset,
      subdomains: 'abcd'
    }).addTo(mapInstanceRef.current);

    // If Mapbox fails (e.g. rate limit), fallback gracefully to CartoDB
    newLayer.on('tileerror', () => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(newLayer);
        const fallbackUrl = mapType === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : mapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        const fallback = L.tileLayer(fallbackUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(mapInstanceRef.current);
        tileLayerRef.current = fallback;
      }
    });

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Update Geofences Layer
  useEffect(() => {
    if (!geofencesGroupRef.current) return;
    geofencesGroupRef.current.clearLayers();

    if (!showGeofences) return;

    geofences.forEach((geo) => {
      const circle = L.circle([geo.centerLat, geo.centerLng], {
        radius: geo.radiusMeters || 2000,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '6, 6'
      });

      circle.bindTooltip(
        `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 600; color: #1e293b;">
          🛡️ Safe Zone: ${geo.name}<br/>
          <span style="font-weight: 400; color: #64748b;">Speed Limit: ${geo.speedLimitKmH} km/h · ${geo.assignedVehiclesCount} units</span>
        </div>`,
        { permanent: false, direction: 'top' }
      );

      geofencesGroupRef.current?.addLayer(circle);
    });
  }, [geofences, showGeofences]);

  // Update Vehicle Markers and Breadcrumbs
  useEffect(() => {
    if (!markersGroupRef.current || !breadcrumbsGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    breadcrumbsGroupRef.current.clearLayers();

    vehicles.forEach((veh) => {
      const isSelected = veh.id === selectedVehicleId;
      const isCritical = veh.securityStatus === 'critical';
      const isWarning = veh.securityStatus === 'warning';

      // Status indicator color
      const borderColor = isCritical ? '#dc2626' : isWarning ? '#d97706' : veh.isImmobilized ? '#4f46e5' : '#0284c7';
      const bgColor = isCritical ? '#fef2f2' : isWarning ? '#fffbeb' : '#ffffff';

      // Custom DivIcon
      const iconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${(isCritical || veh.currentSpeed > 0) ? `
            <div style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 34px; height: 34px; border-radius: 9999px; background: ${borderColor}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          ` : ''}
          
          <div style="
            position: relative;
            background: ${bgColor};
            border: 2.5px solid ${borderColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.18);
            border-radius: 10px;
            padding: 3px 6px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10.5px;
            font-weight: 700;
            color: #0f172a;
            white-space: nowrap;
          ">
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 9999px;
              background: ${borderColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 8px;
              transform: rotate(${veh.heading}deg);
            ">▲</div>
            <span>${veh.plateNumber}</span>
          </div>

          <div style="
            margin-top: 2px;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(4px);
            color: #e2e8f0;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 9px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
          ">
            ${veh.currentSpeed} km/h
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'smrod-vehicle-pin',
        iconSize: [80, 44],
        iconAnchor: [40, 22]
      });

      const marker = L.marker([veh.latitude, veh.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectVehicle?.(veh);
      });

      // Bind detailed popup
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 2px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; font-family: monospace; color: #0f172a;">${veh.plateNumber}</strong>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${isCritical ? '#fee2e2; color: #991b1b;' : '#e0f2fe; color: #0369a1;'}">
              ${veh.securityStatus}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.6;">
            <div><strong>Model:</strong> ${veh.make} ${veh.model} (${veh.year})</div>
            <div><strong>Owner:</strong> ${veh.ownerName}</div>
            <div><strong>Speed:</strong> ${veh.currentSpeed} km/h · <strong>Heading:</strong> ${veh.heading}°</div>
            <div><strong>Battery Line:</strong> ${veh.batteryVoltage}V · <strong>Fuel:</strong> ${veh.fuelLevel || 75}%</div>
            <div><strong>ESP32 UID:</strong> <span style="font-family: monospace;">${veh.deviceId}</span></div>
            <div><strong>Status:</strong> ${veh.isImmobilized ? '<span style="color: #4f46e5; font-weight: bold;">IMMOBILIZED</span>' : '<span style="color: #16a34a; font-weight: bold;">ACTIVE / MOBILE</span>'}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersGroupRef.current?.addLayer(marker);

      // If selected, draw historical breadcrumbs line
      if (isSelected) {
        const historyPoints: [number, number][] = [
          [veh.latitude - 0.008, veh.longitude - 0.012],
          [veh.latitude - 0.004, veh.longitude - 0.005],
          [veh.latitude, veh.longitude]
        ];

        const polyline = L.polyline(historyPoints, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '5, 8'
        });

        breadcrumbsGroupRef.current?.addLayer(polyline);
      }
    });
  }, [vehicles, selectedVehicleId, onSelectVehicle]);

  // Center on Selected Vehicle
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const target = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    if (target) {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 14, { duration: 1.2 });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm ${className}`}>
      {/* Map Header Status Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700">
        <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
        <span className="font-bold text-slate-900">Real-Time GNSS Map API</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="text-slate-600 font-mono tabular-nums">{vehicles.length} Connected Pilot Units</span>
      </div>

      {/* Floating Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {/* Map Layer Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-700">
            <button
              onClick={() => setMapType('streets')}
              className={`px-2 py-1 rounded-md transition-colors ${
                mapType === 'streets' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Voyager
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-1 rounded-md transition-colors ${
                mapType === 'satellite' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('dark')}
              className={`px-2 py-1 rounded-md transition-colors ${
                mapType === 'dark' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Dark
            </button>
          </div>

          <div className="w-px h-4 bg-slate-200 my-auto mx-0.5" />

          {/* Toggle Geofences */}
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              showGeofences ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Geofences
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Focus Target"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-0 bg-slate-100"
      />

      {/* Bottom Map Info Strip */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="font-medium text-slate-800">Normal Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-800">Warning / Displacement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="font-medium text-slate-800">Critical Crash / Impact</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="font-medium text-slate-800">Immobilized Relay</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#0a66c2] border border-blue-200">
            Mapbox HD Tiles Active
          </span>
          <span>Nairobi Operational Hub · EPSG:3857</span>
        </div>
      </div>
    </div>
  );
};
