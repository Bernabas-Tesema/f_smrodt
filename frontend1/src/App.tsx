import React, { useState, useEffect } from 'react';
import {
  Vehicle,
  ESP32Device,
  SecurityEvent,
  RemoteCommand,
  Geofence,
  UserAccount,
  AuditLog,
  UserRole
} from './types/smrod';
import {
  INITIAL_VEHICLES,
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  INITIAL_COMMANDS,
  INITIAL_GEOFENCES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from './data/mockData';
import { VerticalSidebar, SidebarMode } from './components/VerticalSidebar';
import { TopHeaderBar } from './components/TopHeaderBar';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { DevicesView } from './components/DevicesView';
import { SecurityEventsView } from './components/SecurityEventsView';
import { AlertsNotificationsView } from './components/AlertsNotificationsView';
import { TrackingView } from './components/TrackingView';
import { CommandsView } from './components/CommandsView';
import { GeofencesView } from './components/GeofencesView';
import { UsersRolesView } from './components/UsersRolesView';
import { BackendSpecView } from './components/BackendSpecView';
import { BackendFoundationView } from './components/BackendFoundationView';
import { ArchitectureReviewView } from './components/ArchitectureReviewView';
import { ReportsView } from './components/ReportsView';
import { RiskScoreView } from './components/RiskScoreView';
import { AuditLogsView } from './components/AuditLogsView';
import { SystemConfigView } from './components/SystemConfigView';
import { SettingsView } from './components/SettingsView';
import { EmergencyModal } from './components/EmergencyModal';
import { LoginPage } from './components/LoginPage';
import { AIIntelligenceView } from './components/AIIntelligenceView';
import { supabase, SupabaseService } from './services/supabaseClient';
import { roboticVoice } from './services/roboticVoice';
import { CheckCircle2 } from 'lucide-react';
import { PasswordRecoveryPage } from './components/PasswordRecoveryPage';

export default function App() {
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    return hash.get('type') === 'recovery';
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('super_admin');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);

  // Sidebar Mode & Width States (persisted)
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    return (localStorage.getItem('smrod_sidebar_mode') as SidebarMode) || 'full';
  });
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('smrod_sidebar_width');
    return saved ? Math.max(180, Math.min(480, parseInt(saved, 10))) : 260;
  });

  // Application Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [devices, setDevices] = useState<ESP32Device[]>(INITIAL_DEVICES);
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [commands, setCommands] = useState<RemoteCommand[]>(INITIAL_COMMANDS);
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modal & Selection States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation mode
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Supabase Database Load & Realtime Synchronization
  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseData() {
      try {
        const [loadedVehicles, loadedEvents, loadedCommands, loadedGeofences, loadedAuditLogs] =
          await Promise.all([
            SupabaseService.getVehicles(),
            SupabaseService.getSecurityEvents(),
            SupabaseService.getRemoteCommands(),
            SupabaseService.getGeofences(),
            SupabaseService.getAuditLogs()
          ]);

        if (isMounted) {
          if (loadedVehicles && loadedVehicles.length > 0) setVehicles(loadedVehicles);
          if (loadedEvents && loadedEvents.length > 0) setEvents(loadedEvents);
          if (loadedCommands && loadedCommands.length > 0) setCommands(loadedCommands);
          if (loadedGeofences && loadedGeofences.length > 0) setGeofences(loadedGeofences);
          if (loadedAuditLogs && loadedAuditLogs.length > 0) setAuditLogs(loadedAuditLogs);
          setIsSupabaseSynced(true);
        }
      } catch (err) {
        console.warn('[Supabase] Initial sync failed:', err);
      }
    }

    loadSupabaseData();

    // 2. Realtime Subscriptions to PostgreSQL Tables
    const unsubVehicles = SupabaseService.subscribeVehicles(
      (newOrUpdatedVeh) => {
        setVehicles((prev) => {
          const idx = prev.findIndex((v) => v.id === newOrUpdatedVeh.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = newOrUpdatedVeh;
            return next;
          }
          return [newOrUpdatedVeh, ...prev];
        });
      },
      (deletedId) => {
        setVehicles((prev) => prev.filter((v) => v.id !== deletedId));
      }
    );

    const unsubEvents = SupabaseService.subscribeSecurityEvents((incomingEvent) => {
      setEvents((prev) => {
        const idx = prev.findIndex((e) => e.id === incomingEvent.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = incomingEvent;
          return next;
        }
        return [incomingEvent, ...prev];
      });
      showToast(`⚡ PostgreSQL Event: ${incomingEvent.eventType.replace('_', ' ').toUpperCase()}`);
    });

    const unsubCommands = SupabaseService.subscribeRemoteCommands((incomingCmd) => {
      setCommands((prev) => {
        const idx = prev.findIndex((c) => c.id === incomingCmd.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = incomingCmd;
          return next;
        }
        return [incomingCmd, ...prev];
      });
    });

    return () => {
      isMounted = false;
      unsubVehicles();
      unsubEvents();
      unsubCommands();
    };
  }, []);

  // Live Vehicle Movement Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((veh) => {
          if (veh.isImmobilized || veh.currentSpeed === 0) return veh;

          // GPS drift based on speed and heading
          const deltaLat = Math.cos((veh.heading * Math.PI) / 180) * 0.00015 * (veh.currentSpeed / 40);
          const deltaLng = Math.sin((veh.heading * Math.PI) / 180) * 0.00015 * (veh.currentSpeed / 40);

          // Fluctuate speed slightly (+- 2 km/h)
          const newSpeed = Math.max(20, Math.min(105, veh.currentSpeed + (Math.random() * 4 - 2)));

          return {
            ...veh,
            latitude: veh.latitude + deltaLat,
            longitude: veh.longitude + deltaLng,
            currentSpeed: Math.round(newSpeed),
            lastLocationTime: 'Just now'
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handlers with Supabase Realtime CRUD Persistence
  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles(vehicles.map((v) => (v.id === updated.id ? updated : v)));
    SupabaseService.updateVehicle(updated.id, updated);
    showToast(`Vehicle ${updated.plateNumber} profile updated.`);
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles([newVeh, ...vehicles]);
    SupabaseService.createVehicle(newVeh);

    const log: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      actorEmail: `${activeRole}@smrod.ai`,
      actorRole: activeRole,
      action: 'VEHICLE_REGISTERED',
      targetResource: `Vehicle ${newVeh.plateNumber}`,
      ipAddress: '197.232.88.14',
      status: 'success',
      details: `Registered ${newVeh.make} ${newVeh.model} with VIN ${newVeh.vin}`
    };
    setAuditLogs([log, ...auditLogs]);
    SupabaseService.recordAuditLog(log);
    showToast(`Vehicle ${newVeh.plateNumber} successfully registered.`);
  };

  const handleTriggerImmobilization = (vehicle: Vehicle, targetState: boolean) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicle.id ? { ...v, isImmobilized: targetState, currentSpeed: targetState ? 0 : v.currentSpeed } : v
    );
    setVehicles(updatedVehicles);

    // Update Supabase PostgreSQL state
    SupabaseService.setVehicleImmobilized(vehicle.id, targetState, targetState ? 0 : vehicle.currentSpeed);

    // Record Remote Command in Supabase
    const newCmd: RemoteCommand = {
      id: `CMD-${Date.now().toString().slice(-4)}`,
      idempotencyKey: `idemp_${targetState ? 'immob' : 'mob'}_${Date.now()}`,
      timestamp: 'Just now',
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      deviceId: vehicle.deviceId,
      commandType: targetState ? 'immobilize' : 'mobilize',
      issuedBy: `Operator (${activeRole})`,
      operatorRole: activeRole,
      status: 'executed',
      safetyCheckPassed: true,
      deliveryLatencyMs: 142,
      executionResult: targetState
        ? 'Fuel relay cutoff triggered. Vehicle immobilized.'
        : 'Fuel relay power restored. Vehicle mobile.'
    };
    setCommands([newCmd, ...commands]);
    SupabaseService.dispatchCommand(newCmd);

    // Record Audit Log in Supabase
    const log: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      actorEmail: `${activeRole}@smrod.ai`,
      actorRole: activeRole,
      action: targetState ? 'REMOTE_IMMOBILIZATION' : 'REMOTE_MOBILIZATION',
      targetResource: `Vehicle ${vehicle.plateNumber}`,
      ipAddress: '197.232.88.14',
      status: 'success',
      details: `Engine ${targetState ? 'immobilized' : 'mobilized'} via signed MQTT command.`
    };
    setAuditLogs([log, ...auditLogs]);
    SupabaseService.recordAuditLog(log);

    // Speak in robotic car voice
    roboticVoice.speakCommand(targetState ? 'immobilize' : 'mobilize', vehicle.plateNumber);

    showToast(targetState ? `Vehicle ${vehicle.plateNumber} IMMOBILIZED.` : `Vehicle ${vehicle.plateNumber} MOBILIZED.`);
  };

  const handleAddDevice = (newDev: ESP32Device) => {
    setDevices([newDev, ...devices]);
    showToast(`ESP32-S3 hardware record ${newDev.hardwareUid} provisioned.`);
  };

  const handleUpdateDevice = (updated: ESP32Device) => {
    setDevices(devices.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Device ${updated.hardwareUid} configuration saved.`);
  };

  const handleUpdateEventStatus = (eventId: string, newStatus: SecurityEvent['status'], notes?: string) => {
    const existing = events.find((e) => e.id === eventId);
    const assignedOperator = existing?.assignedOperator || `Operator (${activeRole})`;

    setEvents(
      events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: newStatus,
              assignedOperator,
              resolutionNotes: notes || e.resolutionNotes
            }
          : e
      )
    );
    SupabaseService.updateSecurityEvent(eventId, newStatus, notes, assignedOperator);
    showToast(`Incident ${eventId} updated to ${newStatus.toUpperCase()}.`);
  };

  const handleExecuteCommand = (cmdData: Omit<RemoteCommand, 'id' | 'timestamp' | 'idempotencyKey' | 'status'>) => {
    const newCmd: RemoteCommand = {
      ...cmdData,
      id: `CMD-${Date.now().toString().slice(-4)}`,
      idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: 'Just now',
      status: 'executed'
    };
    setCommands([newCmd, ...commands]);
    SupabaseService.dispatchCommand(newCmd);

    if (cmdData.commandType === 'immobilize') {
      setVehicles(vehicles.map((v) => (v.id === cmdData.vehicleId ? { ...v, isImmobilized: true, currentSpeed: 0 } : v)));
      SupabaseService.setVehicleImmobilized(cmdData.vehicleId, true, 0);
    } else if (cmdData.commandType === 'mobilize') {
      setVehicles(vehicles.map((v) => (v.id === cmdData.vehicleId ? { ...v, isImmobilized: false } : v)));
      SupabaseService.setVehicleImmobilized(cmdData.vehicleId, false);
    }

    // Robotic voice announcement
    roboticVoice.speakCommand(cmdData.commandType, cmdData.vehiclePlate);

    showToast(`Command ${cmdData.commandType.toUpperCase()} dispatched to ${cmdData.vehiclePlate}.`);
  };

  const handleAddGeofence = (newGeo: Geofence) => {
    setGeofences([newGeo, ...geofences]);
    SupabaseService.createGeofence(newGeo);
    showToast(`Geofence ${newGeo.name} established.`);
  };

  const handleToggleGeofenceStatus = (geoId: string) => {
    const current = geofences.find((g) => g.id === geoId);
    const nextStatus = current?.status === 'active' ? 'inactive' : 'active';
    setGeofences(
      geofences.map((g) => (g.id === geoId ? { ...g, status: nextStatus } : g))
    );
    SupabaseService.toggleGeofence(geoId, nextStatus);
  };

  const handleAddUser = (user: UserAccount) => {
    setUsers([user, ...users]);
    showToast(`User ${user.fullName} created with role ${user.role.toUpperCase()}.`);
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    showToast(`User role updated to ${newRole.toUpperCase()}.`);
  };

  const handleToggleUserActive = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
  };

  // Emergency handlers
  const handleFleetAlarm = () => {
    roboticVoice.speakEmergency('alarm');
    showToast('🚨 All-units siren & hazard strobe broadcasted to all ESP32 units.');
  };

  const handleFleetLockdown = () => {
    setVehicles(
      vehicles.map((v) => (v.currentSpeed <= 5 ? { ...v, isImmobilized: true } : v))
    );
    roboticVoice.speakEmergency('lockdown');
    showToast('🔒 Stationary fleet lockdown executed. Fuel relays latched.');
  };

  // Login handler
  const handleLoginSuccess = (email: string, role: UserRole) => {
    setActiveRole(role);
    setCurrentTab('dashboard');
    showToast(`Authenticated successfully as ${role.toUpperCase()} (${email})`);
  };

  const handleSignOut = () => {
    setCurrentTab('login-view');
    showToast('Signed out. Session locked.');
  };

  const criticalAlertCount = events.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length;
  const canExecuteCommands = activeRole === 'super_admin' || activeRole === 'admin';

  if (isPasswordRecovery) {
    return (
      <PasswordRecoveryPage
        onComplete={async () => {
          await supabase.auth.signOut();
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsPasswordRecovery(false);
          setCurrentTab('login-view');
        }}
      />
    );
  }

  // If in Login View, display full-screen S-curve login page matching image_4cec9828.png
  if (currentTab === 'login-view') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => setCurrentTab('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-slate-900 font-sans antialiased selection:bg-[#0a66c2] selection:text-white">
      {/* 1. LEFT VERTICAL SIDEBAR matching reference image */}
      <VerticalSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        criticalAlertCount={criticalAlertCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSignOut={handleSignOut}
        mode={sidebarMode}
        onModeChange={setSidebarMode}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      {/* 2. MAIN RIGHT CONTENT CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <TopHeaderBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          criticalAlertCount={criticalAlertCount}
          onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
          activeRole={activeRole}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSignOut={handleSignOut}
          onNavigateToAlerts={() => setCurrentTab('alerts')}
          isSidebarCollapsed={sidebarMode !== 'full'}
          isSupabaseSynced={isSupabaseSynced}
          onToggleSidebarMode={() =>
            setSidebarMode((prev) => (prev === 'full' ? 'rail' : 'full'))
          }
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-5 sm:p-7 max-w-7xl w-full mx-auto space-y-7">
          {currentTab === 'dashboard' && (
            <DashboardView
              vehicles={vehicles}
              devices={devices}
              events={events}
              auditLogs={auditLogs}
              geofences={geofences}
              onSelectVehicle={(veh) => {
                setSelectedVehicle(veh);
                setCurrentTab('vehicles');
              }}
              onSelectEvent={(evt) => {
                setSelectedEvent(evt);
                setCurrentTab('security-events');
              }}
              onUpdateEventStatus={handleUpdateEventStatus}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'ai-intelligence' && (
            <AIIntelligenceView
              vehicles={vehicles}
              activeRole={activeRole}
              onSelectVehicle={(veh) => {
                setSelectedVehicle(veh);
                setCurrentTab('vehicles');
              }}
            />
          )}

          {currentTab === 'vehicles' && (
            <VehiclesView
              vehicles={vehicles}
              devices={devices}
              onUpdateVehicle={handleUpdateVehicle}
              onAddVehicle={handleAddVehicle}
              onTriggerImmobilization={handleTriggerImmobilization}
              canExecuteCommands={canExecuteCommands}
            />
          )}

          {currentTab === 'devices' && (
            <DevicesView
              devices={devices}
              vehicles={vehicles}
              onAddDevice={handleAddDevice}
              onUpdateDevice={handleUpdateDevice}
            />
          )}

          {currentTab === 'security-events' && (
            <SecurityEventsView
              events={events}
              onUpdateEventStatus={handleUpdateEventStatus}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsNotificationsView
              events={events}
              vehicles={vehicles}
              onUpdateEventStatus={handleUpdateEventStatus}
              onNavigateTab={setCurrentTab}
              onSelectEvent={(evt) => {
                setSelectedEvent(evt);
                setCurrentTab('security-events');
              }}
            />
          )}

          {currentTab === 'tracking' && (
            <TrackingView
              vehicles={vehicles}
              geofences={geofences}
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
            />
          )}

          {currentTab === 'commands' && (
            <CommandsView
              commands={commands}
              vehicles={vehicles}
              onExecuteCommand={handleExecuteCommand}
              activeRole={activeRole}
            />
          )}

          {currentTab === 'geofences' && (
            <GeofencesView
              geofences={geofences}
              vehicles={vehicles}
              onAddGeofence={handleAddGeofence}
              onToggleStatus={handleToggleGeofenceStatus}
            />
          )}

          {currentTab === 'risk-scoring' && (
            <RiskScoreView vehicles={vehicles} events={events} />
          )}

          {currentTab === 'users' && (
            <UsersRolesView
              users={users}
              onAddUser={handleAddUser}
              onUpdateRole={handleUpdateUserRole}
              onToggleUserActive={handleToggleUserActive}
            />
          )}

          {currentTab === 'audit-logs' && (
            <AuditLogsView auditLogs={auditLogs} />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              vehicles={vehicles}
              events={events}
              commands={commands}
              devices={devices}
            />
          )}

          {currentTab === 'architecture' && <ArchitectureReviewView />}

          {currentTab === 'backend-foundation' && <BackendFoundationView />}

          {currentTab === 'backend-spec' && (
            <BackendSpecView
              vehicles={vehicles}
              devices={devices}
              events={events}
            />
          )}

          {currentTab === 'system-config' && <SystemConfigView />}

          {currentTab === 'settings' && (
            <SettingsView activeRole={activeRole} onRoleChange={setActiveRole} />
          )}
        </main>

        {/* Crisp clean footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white px-7 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/image_b5e6919a.png"
              alt="Logo"
              className="w-4 h-4 object-contain"
            />
            <strong className="text-slate-800">SMROD AIOT TECH</strong>
            <span aria-hidden="true">·</span>
            <span>Connected Vehicle Operations Center</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>© 2026 SMROD AIOT TECH. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleSignOut}
              className="text-slate-600 hover:text-teal-700 transition-colors font-medium"
            >
              Lock Session
            </button>
          </div>
        </footer>
      </div>

      {/* Emergency Operations Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        vehicles={vehicles}
        onTriggerFleetAlarm={handleFleetAlarm}
        onTriggerFleetLockdown={handleFleetLockdown}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
