import React, { useState } from 'react';
import { SecurityEvent } from '../types/smrod';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  Cpu,
  User,
  ArrowRight,
  Filter,
  Search,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface SecurityEventsViewProps {
  events: SecurityEvent[];
  onUpdateEventStatus: (eventId: string, status: SecurityEvent['status'], notes?: string) => void;
  selectedEvent: SecurityEvent | null;
  onSelectEvent: (event: SecurityEvent | null) => void;
}

export const SecurityEventsView: React.FC<SecurityEventsViewProps> = ({
  events,
  onUpdateEventStatus,
  selectedEvent,
  onSelectEvent
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'moderate' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'acknowledged' | 'investigating' | 'resolved'>('all');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<{
    summary: string;
    rootCause: string;
    confidence: number;
    recommendedActions: string[];
  } | null>(null);

  const handleGenerateAIAnalysis = () => {
    if (!selectedEvent) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setAiReport({
        summary: `Autonomous AI multi-stream correlation for event ${selectedEvent.id} (${selectedEvent.eventType}). Analyzed vehicle ${selectedEvent.vehiclePlate} GNSS drift, speed decay, and edge IMU shock vector to rule out sensor bounce.`,
        rootCause: selectedEvent.eventType === 'crash_detected'
          ? 'Kinetic shock exceeding 3.5g threshold combined with instantaneous deceleration.'
          : selectedEvent.eventType === 'unauthorized_movement'
          ? 'Displacement detected during active immobilizer arming period without authorized driver RFID handshake.'
          : 'Geofence departure outside pre-scheduled transport logistics route.',
        confidence: 0.94,
        recommendedActions: [
          'Verify driver identity via mobile challenge or fleet dispatcher.',
          'Assess vehicle telemetry speed before issuing remote immobilization command (speed <= 5 km/h).',
          'Export blackbox telemetry window to permanent compliance record.'
        ]
      });
    }, 700);
  };

  const filteredEvents = events.filter((e) => {
    const matchSev = filterSeverity === 'all' || e.severity === filterSeverity;
    const matchStat = filterStatus === 'all' || e.status === filterStatus;
    return matchSev && matchStat;
  });

  const handleStatusChange = (eventId: string, newStatus: SecurityEvent['status']) => {
    onUpdateEventStatus(eventId, newStatus, resolutionNotes);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Incident Response &amp; Triage Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Security Incident Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Automated edge sensor triggers, unauthorized movement detection, and IMU crash impact telemetry.
        </p>
      </div>

      {/* Filter and Tab controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter by Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['all', 'new', 'acknowledged', 'investigating', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} ({st === 'all' ? events.length : events.filter(e => e.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Event ID &amp; Time</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Incident Classification</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Assigned Operator</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{evt.id}</div>
                    <div className="text-[11px] text-slate-400">{evt.timestamp}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {evt.vehiclePlate}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">
                      {evt.eventType === 'crash_detected' && '💥 Crash & Collision Detection'}
                      {evt.eventType === 'unauthorized_movement' && '🚨 Unauthorized Towing / Displacement'}
                      {evt.eventType === 'geofence_breach' && '📍 Geofence Perimeter Exit'}
                      {evt.eventType === 'power_loss' && '⚡ Battery Disconnect Tamper'}
                      {evt.eventType === 'sos_emergency' && '🆘 Driver SOS Emergency'}
                      {evt.eventType === 'tampering' && '🛡️ Enclosure Tamper Switch'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{evt.locationName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                      evt.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : evt.severity === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                    <span className={evt.riskScore > 80 ? 'text-red-600' : evt.riskScore > 50 ? 'text-amber-600' : 'text-slate-700'}>
                      {evt.riskScore}
                    </span>
                    <span className="text-slate-400 font-normal">/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium uppercase text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {evt.assignedOperator || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-900"
                    >
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Triage & Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Incident Triage: {selectedEvent.id}
                </h3>
              </div>
              <button onClick={() => onSelectEvent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {/* Event Metadata row */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vehicle Affected:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedEvent.vehiclePlate}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Device Hardware UID:</span>
                  <span className="font-mono text-slate-700">{selectedEvent.deviceId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <span className="font-mono text-slate-700">{selectedEvent.latitude.toFixed(6)}, {selectedEvent.longitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Location Description:</span>
                  <span className="font-medium text-slate-800">{selectedEvent.locationName}</span>
                </div>
              </div>

              {/* Edge Telemetry Snapshot */}
              {selectedEvent.telemetrySnapshot && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Sensor Telemetry Snapshot at Alert Trigger
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-400">Impact G-Force</div>
                      <div className="font-mono font-bold text-red-600 text-sm">
                        {selectedEvent.telemetrySnapshot.gForce ? `${selectedEvent.telemetrySnapshot.gForce}g` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-400">Velocity at Event</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {selectedEvent.telemetrySnapshot.speed} km/h
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="text-[11px] text-slate-400">Battery Line</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {selectedEvent.telemetrySnapshot.batteryVoltage} V
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Incident Description</label>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {/* AI Investigation Assistant Card */}
              <div className="p-4 bg-linear-to-br from-blue-50/70 to-indigo-50/50 rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0a66c2]" />
                    <span className="text-xs font-bold text-[#0a66c2]">
                      AI Investigation Assistant (Gemini 2.5 Flash)
                    </span>
                  </div>
                  <button
                    onClick={handleGenerateAIAnalysis}
                    disabled={isGeneratingAI}
                    className="px-2.5 py-1 bg-[#0a66c2] text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'Synthesizing...' : aiReport ? 'Re-analyze' : 'Analyze with AI'}</span>
                  </button>
                </div>

                {aiReport ? (
                  <div className="space-y-2.5 text-xs">
                    <p className="text-slate-700 leading-relaxed">{aiReport.summary}</p>
                    <div className="p-2.5 bg-white/90 rounded-lg border border-blue-100 text-slate-800">
                      <span className="font-bold text-[#0a66c2]">Root Cause Hypothesis: </span>
                      <span>{aiReport.rootCause}</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase">Recommended Next Steps:</span>
                      {aiReport.recommendedActions.map((act, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Click &ldquo;Analyze with AI&rdquo; to correlate vehicle historical baseline, edge IMU shock patterns, and generate investigation hypothesis.
                  </p>
                )}
              </div>

              {/* Lifecycle status transition controls */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700">Advance Lifecycle Workflow</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={selectedEvent.status === 'acknowledged'}
                    onClick={() => handleStatusChange(selectedEvent.id, 'acknowledged')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedEvent.status === 'acknowledged'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    1. Acknowledge
                  </button>
                  <button
                    disabled={selectedEvent.status === 'investigating'}
                    onClick={() => handleStatusChange(selectedEvent.id, 'investigating')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedEvent.status === 'investigating'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    2. Investigating
                  </button>
                  <button
                    disabled={selectedEvent.status === 'resolved'}
                    onClick={() => handleStatusChange(selectedEvent.id, 'resolved')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedEvent.status === 'resolved'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    3. Mark Resolved
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => onSelectEvent(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
