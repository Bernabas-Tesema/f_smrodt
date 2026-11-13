import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Car,
  Cpu,
  Navigation,
  ShieldAlert,
  Terminal,
  Radio,
  TrendingUp,
  Users,
  ShieldCheck,
  FileText,
  Layers,
  Code2,
  Sliders,
  Settings,
  X,
  UserCheck,
  LogOut,
  LogIn,
  Bell,
  Network,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { UserRole } from '../types/smrod';

export type SidebarMode = 'full' | 'rail' | 'hidden';

export interface VerticalSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  criticalAlertCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  mode?: SidebarMode;
  onModeChange?: (mode: SidebarMode) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
}

export const VerticalSidebar: React.FC<VerticalSidebarProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  onRoleChange,
  criticalAlertCount,
  isOpenMobile,
  onCloseMobile,
  onSignOut,
  mode: controlledMode,
  onModeChange,
  width: controlledWidth,
  onWidthChange
}) => {
  // Mode state: 'full' | 'rail' | 'hidden'
  const [internalMode, setInternalMode] = useState<SidebarMode>(() => {
    return (localStorage.getItem('smrod_sidebar_mode') as SidebarMode) || 'full';
  });
  const currentMode = controlledMode !== undefined ? controlledMode : internalMode;

  const handleSetMode = (newMode: SidebarMode) => {
    if (onModeChange) onModeChange(newMode);
    setInternalMode(newMode);
    localStorage.setItem('smrod_sidebar_mode', newMode);
  };

  // Width state: between 180px and 480px, default 260px
  const [internalWidth, setInternalWidth] = useState<number>(() => {
    const saved = localStorage.getItem('smrod_sidebar_width');
    return saved ? Math.max(180, Math.min(480, parseInt(saved, 10))) : 260;
  });
  const currentWidth = controlledWidth !== undefined ? controlledWidth : internalWidth;

  const handleSetWidth = (newWidth: number) => {
    const clamped = Math.max(180, Math.min(480, Math.round(newWidth)));
    if (onWidthChange) onWidthChange(clamped);
    setInternalWidth(clamped);
    localStorage.setItem('smrod_sidebar_width', clamped.toString());
  };

  // Draggable resizer logic
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // If dragged below 120px, snap to rail mode
      if (e.clientX < 130) {
        handleSetMode('rail');
      } else {
        if (currentMode === 'rail') {
          handleSetMode('full');
        }
        handleSetWidth(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, currentMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: Sparkles, badge: 3 },
    { id: 'tracking', label: 'Live Fleet Map', icon: Navigation },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'devices', label: 'VSCU Devices', icon: Cpu },
    { id: 'security-events', label: 'Security Events', icon: ShieldAlert, badge: criticalAlertCount },
    { id: 'alerts', label: 'Alerts & Notifications', icon: Bell, badge: criticalAlertCount },
    { id: 'commands', label: 'Remote Commands', icon: Terminal },
    { id: 'geofences', label: 'Geofences', icon: Radio },
    { id: 'risk-scoring', label: 'Risk Scoring', icon: TrendingUp },
    { id: 'reports', label: 'Analytics & Reports', icon: FileText },
    { id: 'users', label: 'User Admin', icon: Users },
    { id: 'system-config', label: 'System Config', icon: Sliders },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'backend-foundation', label: 'Backend Foundation', icon: Network },
    { id: 'backend-spec', label: 'Django REST API', icon: Code2 },
    { id: 'architecture', label: 'Architecture Review', icon: Layers },
    { id: 'settings', label: 'Operator Settings', icon: Settings },
    { id: 'login-view', label: 'Sign In / Lock Portal', icon: LogIn }
  ];

  // Effective visual width for desktop
  const computedDesktopWidth =
    currentMode === 'hidden' ? 0 : currentMode === 'rail' ? 72 : currentWidth;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* FLOATING TRIGGER: When completely minimized to the left edge */}
      {currentMode === 'hidden' && (
        <button
          onClick={() => handleSetMode('full')}
          title="Expand Menu"
          className="fixed left-0 top-24 z-50 bg-[#0a66c2] hover:bg-[#084e96] text-white p-2.5 rounded-r-2xl shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer border border-l-0 border-white/20 hover:pl-3.5 group animate-in slide-in-from-left duration-200"
        >
          <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_b5e6919a.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <PanelLeftOpen className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* VERTICAL SIDEBAR CONTAINER */}
      <aside
        style={{
          width: undefined // overridden by responsive classes or inline style on desktop
        }}
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#0a66c2] text-white flex flex-col justify-between shrink-0 shadow-xl transition-all duration-200 ease-out select-none ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          currentMode === 'hidden'
            ? 'lg:w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none'
            : currentMode === 'rail'
            ? 'lg:w-[72px]'
            : ''
        }`}
      >
        {/* Apply dynamic width on desktop when in 'full' mode */}
        <div
          style={{
            width: currentMode === 'full' ? `${currentWidth}px` : undefined
          }}
          className={`h-full flex flex-col justify-between relative ${
            currentMode === 'rail' ? 'w-[72px]' : currentMode === 'hidden' ? 'w-0' : ''
          }`}
        >
          {/* DRAGGABLE RESIZER HANDLE ON RIGHT EDGE (Desktop only, when not hidden) */}
          {currentMode !== 'hidden' && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDoubleClick={() => {
                if (currentMode === 'rail') {
                  handleSetMode('full');
                  handleSetWidth(260);
                } else {
                  handleSetWidth(260);
                }
              }}
              title="Drag to resize width (Double-click to reset)"
              className={`hidden lg:flex absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-50 items-center justify-center group ${
                isDragging ? 'bg-white/30' : 'hover:bg-white/20'
              }`}
            >
              <div
                className={`w-1 h-12 rounded-full transition-colors ${
                  isDragging ? 'bg-white' : 'bg-white/30 group-hover:bg-white'
                }`}
              />
            </div>
          )}

          {/* 1. TOP BRAND HEADER & CONTROLS */}
          <div className="p-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* Logo emblem */}
                <div
                  onClick={() => {
                    if (currentMode === 'rail') handleSetMode('full');
                  }}
                  className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg ring-2 ring-white/30 shrink-0 cursor-pointer hover:scale-105 transition-all hover:ring-white/60"
                  title="SMROD AIOT TECH"
                >
                  <img
                    src="/assets/aistudio/image_b5e6919a.png"
                    alt="SMROD AIOT Logo"
                    className="w-full h-full object-contain filter drop-shadow-xs"
                  />
                </div>

                {/* Brand title - hidden in rail mode */}
                {currentMode === 'full' && (
                  <div className="overflow-hidden min-w-0">
                    <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight truncate flex items-center gap-1.5">
                      <span>SMROD AIOT</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
                    </h1>
                    <p className="text-[11px] text-white/80 font-medium truncate">
                      Connected Vehicle Security
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-white/80 hover:text-white rounded-lg lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Mode Control: ONE clean symbol */}
              <div className="hidden lg:flex items-center">
                {currentMode === 'full' ? (
                  <button
                    onClick={() => handleSetMode('rail')}
                    title="Minimize Menu"
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSetMode('full')}
                    title="Expand Menu"
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors mx-auto cursor-pointer"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. SCROLLABLE NAVIGATION ITEMS */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-white/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
                      currentMode === 'rail'
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-white/20 text-white shadow-xs backdrop-blur-md ring-1 ring-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${currentMode === 'rail' ? 'justify-center' : 'min-w-0'}`}>
                      <Icon className="w-4 h-4 shrink-0 text-white" />
                      {currentMode === 'full' && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {/* Badge */}
                    {item.badge !== undefined && item.badge > 0 && (
                      currentMode === 'full' ? (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs shrink-0 ml-1.5">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0a66c2]" />
                      )
                    )}
                  </button>

                  {/* TOOLTIP ON HOVER (When in rail mode on desktop) */}
                  {currentMode === 'rail' && (
                    <div className="hidden lg:flex items-center gap-2 absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 border border-slate-700">
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-black">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 3. BOTTOM OPERATOR PROFILE CARD */}
          <div className="p-3 border-t border-white/10 bg-black/15 flex flex-col gap-2 shrink-0">
            {currentMode === 'full' ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                      GO
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <div className="text-xs font-bold text-white truncate">Grace Omondi</div>
                      <div className="text-[10px] text-white/70 truncate">admin@smrod.ai</div>
                    </div>
                  </div>

                  <button
                    onClick={onSignOut}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors shrink-0"
                    title="Sign Out / Switch to Login Screen"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Switcher */}
                <div className="flex items-center justify-between bg-white/15 px-2.5 py-1.5 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-white/90 font-medium text-[11px] truncate">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Role:</span>
                  </div>
                  <select
                    value={activeRole}
                    onChange={(e) => onRoleChange(e.target.value as UserRole)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="super_admin" className="bg-[#0a66c2] text-white">Super Admin</option>
                    <option value="admin" className="bg-[#0a66c2] text-white">Admin</option>
                    <option value="operations" className="bg-[#0a66c2] text-white">Operations</option>
                    <option value="support" className="bg-[#0a66c2] text-white">Support</option>
                    <option value="viewer" className="bg-[#0a66c2] text-white">Viewer</option>
                  </select>
                </div>
              </>
            ) : (
              /* Rail Mode Profile Avatar & Sign Out */
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-inner cursor-pointer"
                  title={`Operator: Grace Omondi (${activeRole})`}
                  onClick={() => handleSetMode('full')}
                >
                  GO
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
