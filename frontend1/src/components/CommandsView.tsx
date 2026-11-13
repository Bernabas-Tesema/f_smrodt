import React, { useState } from 'react';
import { RemoteCommand, Vehicle, UserRole } from '../types/smrod';
import {
  Terminal,
  Lock,
  Unlock,
  Bell,
  Activity,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Key,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';
import { roboticVoice } from '../services/roboticVoice';

interface CommandsViewProps {
  commands: RemoteCommand[];
  vehicles: Vehicle[];
  onExecuteCommand: (command: Omit<RemoteCommand, 'id' | 'timestamp' | 'idempotencyKey' | 'status'>) => void;
  activeRole: UserRole;
}

export const CommandsView: React.FC<CommandsViewProps> = ({
  commands,
  vehicles,
  onExecuteCommand,
  activeRole
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [selectedCommandType, setSelectedCommandType] = useState<RemoteCommand['commandType']>('diagnostics_ping');
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutedId, setLastExecutedId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(roboticVoice.isEnabled());

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    roboticVoice.setEnabled(next);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const canExecuteImmobilization = activeRole === 'super_admin' || activeRole === 'admin';
  const speedTooHigh = selectedCommandType === 'immobilize' && (selectedVehicle?.currentSpeed || 0) > 5;

  const handleDispatch = () => {
    if (!selectedVehicle) return;
    if (selectedCommandType === 'immobilize' && !canExecuteImmobilization) return;
    if (speedTooHigh) return;

    setIsExecuting(true);
    setTimeout(() => {
      onExecuteCommand({
        vehicleId: selectedVehicle.id,
        vehiclePlate: selectedVehicle.plateNumber,
        deviceId: selectedVehicle.deviceId,
        commandType: selectedCommandType,
        issuedBy: `Current Operator (${activeRole})`,
        operatorRole: activeRole,
        safetyCheckPassed: true,
        deliveryLatencyMs: Math.floor(Math.random() * 200) + 120,
        executionResult:
          selectedCommandType === 'immobilize'
            ? 'Fuel pump relay power circuit interrupted. Ignition kill active.'
            : selectedCommandType === 'mobilize'
            ? 'Fuel pump relay restored. Ignition kill deactivated.'
            : selectedCommandType === 'trigger_alarm'
            ? 'Vehicle siren and hazard strobe lights pulsed for 30s.'
            : 'Diagnostic telemetry packet generated and received.'
      });
      setIsExecuting(false);
      setLastExecutedId(selectedVehicle.id);
      setTimeout(() => setLastExecutedId(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Cryptographically Audited Edge Dispatch
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Remote Vehicle Command Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor and dispatch signed, time-limited commands to onboard ESP32-S3 devices with idempotency key tracking.
        </p>
      </div>

      {/* Main Grid: Command Dispatcher (Left) + Dispatch History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Command Dispatcher Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Dispatch Edge Command
              </h2>
            </div>

            {/* Robotic Car Voice Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => roboticVoice.testVoice()}
                title="Test robotic car voice audio"
                className="px-2 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Voice</span>
              </button>
              <button
                type="button"
                onClick={handleToggleVoice}
                title={voiceEnabled ? 'Mute robotic car voice' : 'Enable robotic car voice'}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Vehicle selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Select Target Pilot Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} — {v.make} {v.model} ({v.currentSpeed} km/h, {v.isImmobilized ? 'IMMOBILIZED' : 'MOBILIZED'})
                </option>
              ))}
            </select>
          </div>

          {/* Command Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Command Directive</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCommandType('diagnostics_ping')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                  selectedCommandType === 'diagnostics_ping'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Diagnostics Ping</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommandType('trigger_alarm')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                  selectedCommandType === 'trigger_alarm'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Trigger Siren / Strobe</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommandType('immobilize')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                  selectedCommandType === 'immobilize'
                    ? 'border-red-600 bg-red-50/50 text-red-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Immobilize Engine</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommandType('mobilize')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                  selectedCommandType === 'mobilize'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restore Ignition</span>
              </button>
            </div>
          </div>

          {/* Safety Gate Warning for Immobilization */}
          {selectedCommandType === 'immobilize' && (
            <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
              speedTooHigh
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Critical Safety Interlock Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {speedTooHigh ? (
                  <span>
                    <strong>COMMAND BLOCKED:</strong> Vehicle speed is <span className="font-mono">{selectedVehicle.currentSpeed} km/h</span>. Vehicle must be stationary or below 5 km/h before remote immobilization can be authorized.
                  </span>
                ) : (
                  <span>
                    Vehicle speed verified at <span className="font-mono">{selectedVehicle.currentSpeed} km/h</span> (&le; 5 km/h). Safe for relay cutoff. Double-signature authorization will be generated.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Role Permission Check Warning */}
          {!canExecuteImmobilization && selectedCommandType === 'immobilize' && (
            <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600">
              Your active role (<strong>{activeRole}</strong>) lacks permission to immobilize vehicles. Switch to <strong>Super Admin</strong> or <strong>Admin</strong> in the top navigation.
            </div>
          )}

          {/* Dispatch CTA */}
          <button
            onClick={handleDispatch}
            disabled={isExecuting || speedTooHigh || (selectedCommandType === 'immobilize' && !canExecuteImmobilization)}
            className={`w-full py-2.5 px-4 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isExecuting || speedTooHigh || (selectedCommandType === 'immobilize' && !canExecuteImmobilization)
                ? 'bg-slate-400 cursor-not-allowed'
                : selectedCommandType === 'immobilize'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isExecuting ? (
              <span>Dispatching MQTT Payload...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute &amp; Log Directive</span>
              </>
            )}
          </button>
        </div>

        {/* Execution History Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Command Execution History &amp; Acknowledgments
              </h2>
              <p className="text-xs text-slate-500">
                All remote directives cryptographically recorded with latency and device ACKs
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{cmd.vehiclePlate}</span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase px-1.5 py-0.2 bg-slate-100 rounded">
                      {cmd.commandType}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{cmd.status}</span>
                  </span>
                </div>

                <div className="text-slate-600">
                  {cmd.executionResult}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                  <div>Operator: {cmd.issuedBy}</div>
                  <div className="flex items-center gap-3">
                    <span>Latency: {cmd.deliveryLatencyMs}ms</span>
                    <span aria-hidden="true">·</span>
                    <span>{cmd.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
