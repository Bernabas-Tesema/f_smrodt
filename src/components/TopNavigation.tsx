import React from 'react';
import { Shield, AlertTriangle, UserCheck, Layers } from 'lucide-react';
import { UserRole } from '../types/smrod';

interface TopNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  criticalAlertCount: number;
  onOpenEmergencyModal: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  onRoleChange,
  criticalAlertCount,
  onOpenEmergencyModal
}) => {
  return (
    <div className="sticky top-0 z-40 select-none">
      {/* Zone 1 (Wordmark) - Zone 2 (5 Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('dashboard');
            }}
            className="flex items-center gap-2.5 text-base lg:text-lg font-bold tracking-tight text-white whitespace-nowrap"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <span>SMROD AIOT TECH</span>
          </a>
        </div>

        {/* Zone 2: 5 Concise text nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'dashboard' ? 'text-white font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('vehicles')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'vehicles' ? 'text-white font-semibold' : ''
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => onTabChange('devices')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'devices' ? 'text-white font-semibold' : ''
            }`}
          >
            ESP32 Devices
          </button>
          <button
            onClick={() => onTabChange('security-events')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'security-events' ? 'text-white font-semibold' : ''
            }`}
          >
            <span>Security Events</span>
            {criticalAlertCount > 0 && (
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-red-600 text-white rounded font-bold">
                {criticalAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'architecture' ? 'text-indigo-400 font-semibold' : 'text-indigo-300/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture &amp; Roadmap</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
              <option value="admin" className="bg-slate-900 text-white">Admin</option>
              <option value="operations" className="bg-slate-900 text-white">Operations</option>
              <option value="support" className="bg-slate-900 text-white">Support</option>
              <option value="viewer" className="bg-slate-900 text-white">Viewer</option>
            </select>
          </div>

          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Ops</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation Strip for all 16 modules */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-6 lg:px-12 py-2 flex items-center gap-2 overflow-x-auto text-xs text-slate-400">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] shrink-0 mr-1">
          Modules:
        </span>
        {[
          { id: 'dashboard', label: '1. Dashboard' },
          { id: 'vehicles', label: '2. Vehicles' },
          { id: 'devices', label: '3. Devices' },
          { id: 'users', label: '4. Users' },
          { id: 'roles', label: '5. Roles & RBAC' },
          { id: 'tracking', label: '6. Live Tracking' },
          { id: 'security-events', label: '7. Security Events' },
          { id: 'emergency', label: '8. Emergency' },
          { id: 'geofences', label: '9. Geofences' },
          { id: 'commands', label: '10. Commands' },
          { id: 'device-health', label: '11. Health Telemetry' },
          { id: 'risk-scoring', label: '12. Risk Score' },
          { id: 'reports', label: '13. Reports' },
          { id: 'audit-logs', label: '14. Audit Logs' },
          { id: 'system-config', label: '15. System Config' },
          { id: 'settings', label: '16. Admin Profile' },
          { id: 'architecture', label: '★ Architecture Review' },
          { id: 'backend-spec', label: '★ Django API Sandbox' }
        ].map((item) => {
          const isActive = currentTab === item.id || (item.id === 'emergency' && currentTab === 'emergency');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'emergency') {
                  onOpenEmergencyModal();
                } else if (item.id === 'roles') {
                  onTabChange('users');
                } else if (item.id === 'device-health') {
                  onTabChange('devices');
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
