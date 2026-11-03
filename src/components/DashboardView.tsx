import React from 'react';
import { Vehicle, VSCUDevice, SecurityEvent, AuditLog, Geofence } from '../types/smrod';
import { RealLeafletMap } from './RealLeafletMap';
import {
  Car,
  Cpu,
  ShieldAlert,
  Radio,
  ArrowUpRight,
  Battery,
  Signal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Download,
  RotateCw,
  Plus,
  Unlock,
  FileText,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Navigation
} from 'lucide-react';

interface DashboardViewProps {
  vehicles: Vehicle[];
  devices: VSCUDevice[];
  events: SecurityEvent[];
  auditLogs: AuditLog[];
  geofences: Geofence[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onSelectEvent: (event: SecurityEvent) => void;
  onUpdateEventStatus: (eventId: string, newStatus: SecurityEvent['status']) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  devices,
  events,
  auditLogs,
  geofences,
  onSelectVehicle,
  onSelectEvent,
  onUpdateEventStatus,
  onNavigateTab
}) => {
  const onlineDevicesCount = devices.filter((d) => d.connectionStatus === 'online').length;
  const offlineDevicesCount = devices.filter((d) => d.connectionStatus !== 'online').length;
  const activeAlerts = events.filter((e) => e.status !== 'resolved');
  const criticalCount = events.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length;
  const vehiclesMovingCount = vehicles.filter((v) => v.isMoving || v.currentSpeed > 0).length;
  const vehiclesWithIncidentsCount = vehicles.filter((v) => v.hasIncident || v.securityStatus !== 'normal').length;

  return (
    <div className="space-y-7">
      {/* 1. HERO BANNER matching WDS-001 + reference image */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0b3b75] via-[#0d47a1] to-[#1565c0] text-white p-6 sm:p-7 shadow-lg overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  SMROD Operations Center
                </h2>
                <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white/90">
                  Fleet Online &amp; Guarded
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
                Central control center for monitoring fleet vehicles, VSCU devices, and real-time security events
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onNavigateTab('reports')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors backdrop-blur-md border border-white/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Summary</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-colors backdrop-blur-md border border-white/20"
                title="Refresh Feed"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Inset Stat Cards inside Hero Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                <Car className="w-3.5 h-3.5" />
                <span>1. Total Registered</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {vehicles.length} Vehicles
              </div>
              <div className="text-[11px] text-emerald-300 font-medium">
                100% VSCU Paired
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                <span>2. Online / Offline</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {onlineDevicesCount} <span className="text-sm font-normal text-blue-200">on</span> / {offlineDevicesCount} <span className="text-sm font-normal text-blue-200">off</span>
              </div>
              <div className="text-[11px] text-emerald-300 font-medium">
                83.3% Online Uptime
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                <Navigation className="w-3.5 h-3.5" />
                <span>3. Currently Moving</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {vehiclesMovingCount} Units
              </div>
              <div className="text-[11px] text-emerald-300 font-medium">
                Live Doppler Telemetry
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 sm:p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>4. Security Incidents</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {vehiclesWithIncidentsCount} Flagged
              </div>
              <div className="text-[11px] text-amber-300 font-medium">
                {activeAlerts.length} Active Triage
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FLEET METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1 & 2: Registered Vehicles & VSCU Hardware */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a66c2] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Registered
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {vehicles.length} Units
            </div>
            <div className="text-xs text-slate-500 font-medium">Total Registered Vehicles</div>
            <div className="text-[11px] text-slate-400">Toyota, Hyundai, Mercedes, Isuzu</div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Fleet Deployment</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#0a66c2] h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Metric 3: Online / Offline VSCU Devices */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Hardware
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {onlineDevicesCount} Online <span className="text-base text-slate-400 font-normal">/ {offlineDevicesCount} Offline</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">VSCU Hardware Status (ESP32-S3)</div>
            <div className="text-[11px] text-slate-400">mTLS X.509 Device Certs Verified</div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Connectivity Health</span>
              <span>83.3%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '83.3%' }} />
            </div>
          </div>
        </div>

        {/* Metric 4 & 5: Vehicles Moving & Security Incidents */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Live Threat
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {vehiclesMovingCount} Moving <span className="text-base text-amber-600 font-normal">/ {vehiclesWithIncidentsCount} Incidents</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Dynamic Movement &amp; Threat State</div>
            <div className="text-[11px] text-slate-400">1 Crash Collision · 1 Unauthorized Tow</div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Active Threat Level</span>
              <span className="text-amber-600 font-bold">ELEVATED</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '66%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. REAL MAP SECTION + RECENT SYSTEM ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Leaflet Map Viewport */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Fleet Monitoring
              </h3>
              <p className="text-xs text-slate-500">
                Real-time telematics tracking with Doppler velocity and safe geofence perimeters
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('tracking')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a66c2] hover:text-[#0855a1]"
            >
              <span>Full Screen Tracking</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RealLeafletMap
            vehicles={vehicles}
            geofences={geofences}
            onSelectVehicle={onSelectVehicle}
            height="460px"
          />
        </div>

        {/* Recent System Activities & Live Incident Feed */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Activities</h3>
                <p className="text-xs text-slate-500">Live telematics stream</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px] pt-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="py-3 cursor-pointer hover:bg-slate-50/80 rounded-xl px-2 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {evt.vehiclePlate}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {evt.timestamp}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800">
                    {evt.eventType === 'crash_detected' && '💥 High Impact Crash Triggered'}
                    {evt.eventType === 'unauthorized_movement' && '🚨 Unauthorized Towing / Movement'}
                    {evt.eventType === 'geofence_breach' && '📍 Geofence Perimeter Breach'}
                    {evt.eventType === 'power_loss' && '⚡ Vehicle Battery Cutoff Detected'}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {evt.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">Risk Score: {evt.riskScore}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      evt.status === 'new' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('security-events')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            View All Incident Activities
          </button>
        </div>
      </div>

      {/* 4. QUICK ACTION SHORTCUTS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
        <p className="text-xs text-slate-500">Access core operational management workflows</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('vehicles')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0a66c2] to-[#0855a1] text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Vehicle Management</div>
              <div className="text-[11px] text-blue-100">Register &amp; assign VSCUs</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('devices')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">VSCU Device Registry</div>
              <div className="text-[11px] text-emerald-100">IMEI, serial &amp; health</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Analytics &amp; Reports</div>
              <div className="text-[11px] text-orange-100">Fleet usage &amp; uptime</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('system-config')}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">System Configuration</div>
              <div className="text-[11px] text-purple-100">Thresholds &amp; integrations</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
