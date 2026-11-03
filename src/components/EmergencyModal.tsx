import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Radio, Lock, Bell, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../types/smrod';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onTriggerFleetAlarm: () => void;
  onTriggerFleetLockdown: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onTriggerFleetAlarm,
  onTriggerFleetLockdown
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFleetAlarm = () => {
    onTriggerFleetAlarm();
    setActionTriggered('Fleet audible sirens triggered on all connected ESP32 units.');
    setTimeout(() => {
      setActionTriggered(null);
      onClose();
    }, 2500);
  };

  const handleFleetLockdown = () => {
    if (!confirmed) return;
    onTriggerFleetLockdown();
    setActionTriggered('Emergency lockdown dispatched: Stationary units immobilized.');
    setTimeout(() => {
      setActionTriggered(null);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-red-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold tracking-tight">
              Emergency Operations Center
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          <p className="leading-relaxed">
            This console triggers emergency directives across the entire <strong>SMROD Pilot Fleet ({vehicles.length} vehicles)</strong>. Actions are immediately pushed over MQTT over TLS 1.3 and cryptographically logged to the immutable audit trail.
          </p>

          {actionTriggered ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionTriggered}</span>
            </div>
          ) : (
            <>
              {/* Emergency Option 1: Fleet Siren */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
                    <Bell className="w-4 h-4 text-amber-700" />
                    <span>Trigger All-Units Emergency Siren &amp; Strobe</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Pulses 110dB sirens and emergency strobe lights on all {vehicles.length} fleet units for 60 seconds.
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleFleetAlarm}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors text-xs"
                  >
                    Broadcast Siren
                  </button>
                </div>
              </div>

              {/* Emergency Option 2: Fleet Containment Lockdown */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-red-950 flex items-center gap-1.5 text-sm">
                    <Lock className="w-4 h-4 text-red-700" />
                    <span>Emergency Fleet Lockdown</span>
                  </div>
                </div>
                <p className="text-[11px] text-red-900 leading-relaxed">
                  Immobilizes all stationary fleet vehicles (velocity &lt; 5 km/h) by triggering fuel relay cutoffs. Requires double-confirmation.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="confirmLock"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="confirmLock" className="text-[11px] text-red-950 font-medium">
                    I verify this is an active security emergency
                  </label>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    disabled={!confirmed}
                    onClick={handleFleetLockdown}
                    className={`px-3.5 py-1.5 font-semibold rounded-lg transition-colors text-xs ${
                      confirmed ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Execute Fleet Lockdown
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
