import React, { useState } from 'react';
import { SecurityEvent, Vehicle } from '../types/smrod';
import {
  Bell,
  BellRing,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  Radio,
  Smartphone,
  Shield,
  Volume2,
  VolumeX,
  CheckCheck,
  ArrowRight,
  Filter
} from 'lucide-react';

interface AlertsNotificationsViewProps {
  events: SecurityEvent[];
  vehicles: Vehicle[];
  onUpdateEventStatus: (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => void;
  onNavigateTab: (tab: string) => void;
  onSelectEvent: (event: SecurityEvent) => void;
}

export const AlertsNotificationsView: React.FC<AlertsNotificationsViewProps> = ({
  events,
  vehicles,
  onUpdateEventStatus,
  onNavigateTab,
  onSelectEvent
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'acknowledged'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<Record<string, string>>({});
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const operatorsList = [
    'Operations Desk #1 (Main)',
    'Mobile Patrol Unit Alpha',
    'Senior Watch Commander',
    'Fleet Dispatcher - Nairobi',
    'Automated Incident Router'
  ];

  const showNotificationToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  const criticalEvents = events.filter((e) => e.severity === 'critical');
  const warningEvents = events.filter((e) => e.severity === 'high' || e.severity === 'moderate');
  const pendingAcknowledgment = events.filter((e) => e.status === 'new');

  const filteredEvents = events.filter((e) => {
    if (activeFilter === 'critical') return e.severity === 'critical';
    if (activeFilter === 'warning') return e.severity === 'high' || e.severity === 'moderate';
    if (activeFilter === 'acknowledged') return e.status === 'acknowledged' || e.status === 'resolved';
    return true;
  });

  const handleAssignOperator = (eventId: string, operator: string) => {
    setSelectedOperator((prev) => ({ ...prev, [eventId]: operator }));
    onUpdateEventStatus(eventId, 'acknowledged', `Assigned to ${operator} for direct response.`);
    showNotificationToast(`Alert ${eventId} assigned to ${operator}`);
  };

  const handleAcknowledgeAll = () => {
    pendingAcknowledgment.forEach((e) => {
      onUpdateEventStatus(e.id, 'acknowledged', 'Batch acknowledged from Alerts Center.');
    });
    showNotificationToast(`Acknowledged ${pendingAcknowledgment.length} incoming alerts.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Incident Operations
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0a66c2]">
              Real-time Event Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Alerts &amp; Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Critical security alarms, warning notifications, operator triage, and automated multi-channel escalation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle siren sound cues"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Audio Alerts: On' : 'Audio Alerts: Off'}</span>
          </button>

          {pendingAcknowledgment.length > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#084e96] rounded-xl shadow-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Acknowledge All ({pendingAcknowledgment.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-red-50 text-red-600 rounded-xl">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Critical Alerts
          </div>
          <div className="text-2xl font-black font-mono text-red-600 mt-1">
            {criticalEvents.length}
          </div>
          <div className="text-[11px] text-red-700/80 mt-1 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            Immediate operator action required
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Warning Notifications
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            {warningEvents.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1 font-medium">
            Geofence breaches &amp; low battery
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-blue-50 text-[#0a66c2] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Avg. Acknowledgment
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            38.4s
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            &darr; 12% faster than SLA target (60s)
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Escalation Gateways
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            4 / 4
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            SMS, Web Push, WebSockets, Radio
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({events.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'critical'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 bg-red-50 hover:bg-red-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Critical Only ({criticalEvents.length})
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Warnings ({warningEvents.length})
          </button>
          <button
            onClick={() => setActiveFilter('acknowledged')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeFilter === 'acknowledged'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Acknowledged / Closed
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {filteredEvents.length} items</span>
        </div>
      </div>

      {/* 4. Main Alert Items List */}
      <div className="space-y-3.5">
        {filteredEvents.map((evt) => {
          const associatedVeh = vehicles.find((v) => v.id === evt.vehicleId);
          const isCritical = evt.severity === 'critical';
          const isPending = evt.status === 'new';

          return (
            <div
              key={evt.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                isCritical
                  ? 'border-red-200 bg-linear-to-r from-red-50/40 via-white to-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Left Column: Icon & Details */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                    isCritical
                      ? 'bg-red-100 text-red-600 ring-4 ring-red-50'
                      : evt.severity === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isCritical ? (
                    <AlertOctagon className="w-6 h-6 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {evt.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-600 text-white'
                          : evt.severity === 'high'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {evt.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      {evt.eventType.replace(/_/g, ' ').toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {evt.timestamp}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {evt.description}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div>
                      Target Vehicle:{' '}
                      <strong className="text-slate-800 font-mono">
                        {evt.vehiclePlate}
                      </strong>{' '}
                      ({associatedVeh?.make} {associatedVeh?.model})
                    </div>
                    <span aria-hidden="true">·</span>
                    <div>
                      Location: <span className="text-slate-700">{evt.locationName}</span>
                    </div>
                    <span aria-hidden="true">·</span>
                    <div>
                      Risk Score:{' '}
                      <span className="font-mono font-bold text-red-600">
                        {evt.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {evt.telemetrySnapshot && (
                    <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 font-mono">
                      <span>Speed: <strong>{evt.telemetrySnapshot.speed} km/h</strong></span>
                      {evt.telemetrySnapshot.gForce && (
                        <span>IMU Impact: <strong>{evt.telemetrySnapshot.gForce}G</strong></span>
                      )}
                      <span>Battery: <strong>{evt.telemetrySnapshot.batteryVoltage}V</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Operator Assignment & Action Dispatch */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                {/* Operator Assignment Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Assign Operator</span>
                  </label>
                  <select
                    value={selectedOperator[evt.id] || evt.assignedOperator || ''}
                    onChange={(e) => handleAssignOperator(evt.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                  >
                    <option value="">Unassigned</option>
                    {operatorsList.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Indicator & Action Buttons */}
                <div className="flex items-center gap-2">
                  {isPending ? (
                    <button
                      onClick={() => {
                        onUpdateEventStatus(evt.id, 'acknowledged', 'Acknowledged by duty officer.');
                        showNotificationToast(`Alert ${evt.id} acknowledged.`);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] transition-colors shadow-xs"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{evt.status.toUpperCase()}</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      onSelectEvent(evt);
                      onNavigateTab('security-events');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Automated Multi-Channel Escalation Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Notification &amp; Escalation Gateways
            </h3>
            <p className="text-xs text-slate-500">
              Automatic alert dispatches to vehicle owners, law enforcement, and security operations center.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            Gateway Health: 100% Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>SMS Gateway</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              Dispatches encrypted SMS to vehicle owner within 3 seconds of tamper or unauthorized movement.
            </p>
            <div className="text-[10px] font-mono text-slate-400">Twilio / Safaricom API</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#0a66c2]" />
                <span>WebSocket Stream</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              Pushes live telemetry and instant popups directly to active admin sessions and operator monitors.
            </p>
            <div className="text-[10px] font-mono text-slate-400">Django Channels / Redis</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-red-600" />
                <span>Emergency Relay</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              Dual-operator authentication protocol for high-risk remote immobilization and siren triggering.
            </p>
            <div className="text-[10px] font-mono text-slate-400">SDS-001 Interlock Active</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-purple-600" />
                <span>Push Notifications</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              Flutter mobile app instant push alerts for critical security alarms and geofence exit triggers.
            </p>
            <div className="text-[10px] font-mono text-slate-400">Firebase Cloud Messaging</div>
          </div>
        </div>
      </div>
    </div>
  );
};
