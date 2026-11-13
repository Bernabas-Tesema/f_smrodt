import React from 'react';
import { Vehicle, SecurityEvent } from '../types/smrod';
import { ShieldAlert, Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface RiskScoreViewProps {
  vehicles: Vehicle[];
  events: SecurityEvent[];
}

export const RiskScoreView: React.FC<RiskScoreViewProps> = ({ vehicles, events }) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Predictive Threat Evaluation Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Security Risk Score Monitoring
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time dynamic threat scoring engine evaluating IMU sensor shocks, unauthorized velocity vectors, and perimeter breaches.
        </p>
      </div>

      {/* Algorithm Weights Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Edge Threat Assessment Model
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-500 text-xs">IMU Impact / Crash Shock</div>
            <div className="text-2xl font-bold font-mono text-indigo-700">40%</div>
            <div className="text-[11px] text-slate-400">Triggered &gt; 3.0g sudden jerk</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-500 text-xs">Ignition-Off Displacement</div>
            <div className="text-2xl font-bold font-mono text-indigo-700">25%</div>
            <div className="text-[11px] text-slate-400">Unauthorized towing detection</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-500 text-xs">Geofence Perimeter Breach</div>
            <div className="text-2xl font-bold font-mono text-indigo-700">20%</div>
            <div className="text-[11px] text-slate-400">Outside scheduled route corridor</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-slate-500 text-xs">Battery Cutoff / Tamper</div>
            <div className="text-2xl font-bold font-mono text-indigo-700">15%</div>
            <div className="text-[11px] text-slate-400">Line voltage &lt; 11.8V disconnect</div>
          </div>
        </div>
      </div>

      {/* Fleet Risk Distribution List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Vehicle Real-Time Risk Index
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Updated dynamically from ESP32-S3 sensor feeds
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {vehicles.map((v) => {
            const relatedEvents = events.filter((e) => e.vehicleId === v.id && e.status !== 'resolved');
            const calculatedRisk = relatedEvents.length > 0 ? Math.max(...relatedEvents.map((e) => e.riskScore)) : 12;
            return (
              <div key={v.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{v.plateNumber}</span>
                    <span className="text-xs text-slate-600">{v.make} {v.model} ({v.year})</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Owner: {v.ownerName} · Speed: {v.currentSpeed} km/h · Battery: {v.batteryVoltage}V
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-44 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Risk Assessment</span>
                      <span className={`font-mono font-bold ${
                        calculatedRisk > 80 ? 'text-red-600' : calculatedRisk > 50 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {calculatedRisk}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          calculatedRisk > 80 ? 'bg-red-500' : calculatedRisk > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${calculatedRisk}%` }}
                      />
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded ${
                    calculatedRisk > 80
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : calculatedRisk > 50
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {calculatedRisk > 80 ? 'CRITICAL RISK' : calculatedRisk > 50 ? 'ELEVATED' : 'NOMINAL'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
