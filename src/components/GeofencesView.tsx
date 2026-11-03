import React, { useState } from 'react';
import { Geofence, Vehicle } from '../types/smrod';
import { RealLeafletMap } from './RealLeafletMap';
import { Radio, Plus, MapPin, Gauge, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface GeofencesViewProps {
  geofences: Geofence[];
  vehicles: Vehicle[];
  onAddGeofence: (newGeo: Geofence) => void;
  onToggleStatus: (geofenceId: string) => void;
}

export const GeofencesView: React.FC<GeofencesViewProps> = ({
  geofences,
  vehicles,
  onAddGeofence,
  onToggleStatus
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRadius, setNewRadius] = useState('2000');
  const [newSpeedLimit, setNewSpeedLimit] = useState('50');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newGeo: Geofence = {
      id: `geo-${Date.now().toString().slice(-3)}`,
      name: newName,
      type: 'circle',
      radiusMeters: parseInt(newRadius) || 2000,
      centerLat: -1.286389,
      centerLng: 36.817223,
      status: 'active',
      speedLimitKmH: parseInt(newSpeedLimit) || 50,
      assignedVehiclesCount: vehicles.length,
      breachCount24h: 0,
      createdAt: 'Today'
    };

    onAddGeofence(newGeo);
    setIsCreateOpen(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0a66c2] uppercase tracking-wider mb-1">
            Spatial Perimeter Governance &amp; Corridors
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Geofence Management (Real Map API)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define authorized containment zones, speed limit corridors, and automated alert triggers.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#0855a1] rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Geofence Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Geofence Map */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-700">
            Active Geofence Boundaries Overlay
          </div>
          <RealLeafletMap
            vehicles={vehicles}
            geofences={geofences}
            height="460px"
          />
        </div>

        {/* Geofences List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Registered Safe Corridors ({geofences.length})
          </div>

          <div className="space-y-3">
            {geofences.map((geo) => (
              <div
                key={geo.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {geo.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Created {geo.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{geo.type} zone</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                    geo.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {geo.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400">Radius</div>
                    <div className="font-mono font-bold text-slate-800">
                      {(geo.radiusMeters || 0) / 1000} km
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400">Speed Limit</div>
                    <div className="font-mono font-bold text-slate-800">
                      {geo.speedLimitKmH} km/h
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-400">24h Breaches</div>
                    <div className={`font-mono font-bold ${geo.breachCount24h > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {geo.breachCount24h}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Assigned: <strong className="text-slate-800">{geo.assignedVehiclesCount} vehicles</strong>
                  </span>
                  <button
                    onClick={() => onToggleStatus(geo.id)}
                    className="text-xs font-bold text-[#0a66c2] hover:text-[#0855a1]"
                  >
                    {geo.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Geofence Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Create Safe Containment Zone
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mombasa Freight Terminal Zone"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    value={newRadius}
                    onChange={(e) => setNewRadius(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Speed Limit (km/h)</label>
                  <input
                    type="number"
                    value={newSpeedLimit}
                    onChange={(e) => setNewSpeedLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#0855a1] rounded-lg"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
