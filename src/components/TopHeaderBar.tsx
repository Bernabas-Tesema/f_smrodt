import React from 'react';
import { Search, Bell, Menu, AlertTriangle, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { UserRole } from '../types/smrod';

interface TopHeaderBarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  criticalAlertCount: number;
  onOpenEmergencyModal: () => void;
  activeRole: UserRole;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSignOut: () => void;
  onNavigateToAlerts?: () => void;
  onToggleSidebarMode?: () => void;
  isSidebarCollapsed?: boolean;
  isSupabaseSynced?: boolean;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  criticalAlertCount,
  onOpenEmergencyModal,
  activeRole,
  searchQuery,
  onSearchChange,
  onSignOut,
  onNavigateToAlerts,
  onToggleSidebarMode,
  isSidebarCollapsed,
  isSupabaseSynced = false
}) => {
  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard', sub: 'Manage your connected vehicle operations and live security feed here' };
      case 'ai-intelligence':
        return { title: 'AI Intelligence System', sub: 'Predictive theft classification, crash triage, risk engines, and model performance' };
      case 'vehicles':
        return { title: 'Vehicle Registry', sub: 'Comprehensive fleet registry, license plates, and operational status' };
      case 'devices':
        return { title: 'VSCU Hardware Units', sub: 'IoT edge gateway monitoring, firmware, and telemetry' };
      case 'tracking':
        return { title: 'Live Vehicle Tracking', sub: 'Real-time GPS coordinates, Doppler velocity, and heading vectors' };
      case 'security-events':
        return { title: 'Security Incident Command', sub: 'Triage crash detections, tampering alerts, and tow triggers' };
      case 'alerts':
        return { title: 'Alerts & Notifications', sub: 'Critical alarms, warning notifications, operator triage, and automated dispatch' };
      case 'commands':
        return { title: 'Remote Command Dispatcher', sub: 'Dispatched signed engine immobilization directives and alarms' };
      case 'geofences':
        return { title: 'Geofence Boundaries', sub: 'Configure automated safe containment zones and speed limits' };
      case 'risk-scoring':
        return { title: 'Risk Score Engine', sub: 'Dynamic threat evaluation weighting sensor shock and speed' };
      case 'users':
        return { title: 'User Accounts & Roles', sub: 'Enterprise user accounts, access control, and role permissions' };
      case 'audit-logs':
        return { title: 'System Audit Logs', sub: 'Cryptographically verifiable administrative audit trail' };
      case 'reports':
        return { title: 'Reports & Analytics', sub: 'Fleet utilization, incident frequency, and downloadable exports' };
      case 'architecture':
        return { title: 'Architecture Specification & Roadmap', sub: 'Complete 8-part system architecture review and milestones' };
      case 'backend-foundation':
        return { title: 'Backend Foundation & Dependency Graph', sub: 'Django modular architecture, dependency DAG, and developer guide' };
      case 'backend-spec':
        return { title: 'Django REST API Sandbox', sub: 'Interactive OpenAPI explorer and PostgreSQL code blueprints' };
      case 'system-config':
        return { title: 'System Configuration', sub: 'Broker connection, Supabase secrets, and task queues' };
      case 'settings':
        return { title: 'Admin Settings', sub: 'Operator profile credentials and security preferences' };
      case 'login-view':
        return { title: 'Security Login Portal', sub: 'Supabase Auth session authentication & operator login' };
      default:
        return { title: 'SMROD Platform', sub: 'Vehicle Security Operations Center' };
    }
  };

  const { title, sub } = getPageTitle(currentTab);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
      {/* Title & Mobile Hamburger & Desktop Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {onToggleSidebarMode && (
          <button
            onClick={onToggleSidebarMode}
            title={isSidebarCollapsed ? "Expand Sidebar Menu" : "Minimize Sidebar Menu to Left"}
            className="hidden lg:flex p-2 text-slate-500 hover:text-[#0a66c2] hover:bg-blue-50 rounded-xl transition-colors shrink-0 border border-slate-200"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#0a66c2]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 font-medium">{sub}</p>
        </div>
      </div>

      {/* Right Actions: Search + Bell + Emergency + Avatar + Sign Out */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Search bar matching reference image */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search fleet, plates, events..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white transition-all text-slate-800"
          />
        </div>

        {/* Supabase PostgreSQL Realtime Status Badge */}
        <div
          title={isSupabaseSynced ? "Connected to Supabase PostgreSQL Realtime (tobexeirhbjehfwrojty)" : "Connecting to Supabase Cloud..."}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700"
        >
          <span className={`w-2 h-2 rounded-full ${isSupabaseSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-900">PostgreSQL</span>
          <span className="text-[10px] text-slate-400">Live</span>
        </div>

        {/* Emergency Ops Button */}
        <button
          onClick={onOpenEmergencyModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Emergency Ops</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={onNavigateToAlerts}
            title="View Alerts & Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {criticalAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* User avatar circle */}
        <div className="w-8 h-8 rounded-full bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          GO
        </div>

        {/* Sign Out / Lock icon */}
        <button
          onClick={onSignOut}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Sign Out / Switch to Login Screen"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
