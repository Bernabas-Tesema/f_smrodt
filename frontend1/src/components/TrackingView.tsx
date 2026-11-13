import React, { useState } from 'react';
import { Vehicle, Geofence } from '../types/smrod';
import { RealLeafletMap } from './RealLeafletMap';
import {
  Car,
  Navigation,
  Gauge,
  Compass,
  Play,
  Pause,
  MapPin,
  Clock,
  Battery,
  Shield,
  Activity,
  Radio,
  Lock
} from 'lucide-react';

interface TrackingViewProps {
  vehicles: Vehicle[];
  geofences: Geofence[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  vehicles,
  geofences,
  isSimulating,
  onToggleSimulation
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="space-y-6">
      {/* Header with live simulation control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0a66c2] uppercase tracking-wider mb-1">
            Real-Time GNSS Dispatch &amp; Spatial Corridors
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Live Vehicle Tracking (Real Map API)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CartoDB Voyager vector tiles with sub-meter GNSS positioning, Doppler velocity, and heading vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSimulation}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors shadow-xs ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Movement Simulation' : 'Start Movement Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Real Leaflet Map & Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expanded Map Viewport */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <RealLeafletMap
            vehicles={vehicles}
            geofences={geofences}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(veh) => setSelectedVehicleId(veh.id)}
            height="540px"
          />
        </div>

        {/* Selected Vehicle Telemetry & Navigation Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Vehicle Switcher */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pilot Fleet Selector
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    v.id === selectedVehicleId
                      ? 'border-[#0a66c2] bg-blue-50/70 text-[#0a66c2] font-bold ring-2 ring-[#0a66c2]/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-mono font-bold">{v.plateNumber}</div>
                  <div className="text-[10px] text-slate-500 truncate">{v.model}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Telemetry Telemetry Gauges */}
          {selectedVehicle && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-mono font-bold text-slate-900 text-base">
                    {selectedVehicle.plateNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </p>
                </div>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${
                  selectedVehicle.securityStatus === 'critical'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedVehicle.securityStatus}
                </span>
              </div>

              {/* Speed & Heading Visualizer */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Gauge className="w-3.5 h-3.5 text-[#0a66c2]" />
                    <span>Ground Velocity</span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums my-1">
                    {selectedVehicle.currentSpeed} <span className="text-xs font-normal text-slate-500">km/h</span>
                  </div>
                  <div className="text-[10px] text-slate-400">GNSS Doppler Fix</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-[#0a66c2]" />
                    <span>Heading Vector</span>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 tabular-nums my-1">
                    {selectedVehicle.heading}°
                  </div>
                  <div className="text-[10px] text-slate-400">IMU Compass Course</div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Latitude:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{selectedVehicle.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Longitude:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{selectedVehicle.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Last Ping:</span>
                  <span className="text-slate-500 font-sans">{selectedVehicle.lastLocationTime}</span>
                </div>
              </div>

              {/* Connected ESP32 unit */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hardware Telemetry Stream</span>
                </div>
                <div className="font-mono text-slate-800 font-bold">{selectedVehicle.deviceId}</div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Voltage: {selectedVehicle.batteryVoltage}V · Fuel: {selectedVehicle.fuelLevel || 75}% · Odo: {selectedVehicle.odometerKm.toLocaleString()} km
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
