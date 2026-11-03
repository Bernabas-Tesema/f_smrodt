import React, { useState } from 'react';
import {
  Boxes,
  Network,
  GitFork,
  Database,
  Shield,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
  Code2,
  CheckCircle2,
  Clock,
  Radio,
  FileCode,
  Copy,
  Check,
  Search,
  ExternalLink,
  Lock,
  Zap,
  Server,
  Play,
  Share2,
  FolderTree,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface DjangoModuleInfo {
  id: string;
  name: string;
  layer: 'core' | 'ingestion' | 'security' | 'delivery' | 'infrastructure';
  description: string;
  models: string[];
  tables: string[];
  services: string[];
  endpoints: string[];
  celeryTasks: string[];
  websocketEvents: string[];
  dependencies: string[];
  dependents: string[];
  status: 'Ready' | 'In Progress' | 'Planned';
}

export const BackendFoundationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'matrix' | 'flow' | 'guide' | 'blueprints'>('graph');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('vehicles');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [searchModule, setSearchModule] = useState('');
  const [filterLayer, setFilterLayer] = useState<string>('all');

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const djangoModules: DjangoModuleInfo[] = [
    {
      id: 'accounts',
      name: 'accounts',
      layer: 'core',
      description: 'Supabase Auth JWT token verification, operator sessions, and authentication middleware.',
      models: ['SupabaseUser', 'OperatorSession'],
      tables: ['auth_supabase_sessions'],
      services: ['SupabaseJWTAuthentication', 'verify_token_claims()'],
      endpoints: ['POST /api/v1/accounts/verify/', 'GET /api/v1/accounts/me/'],
      celeryTasks: ['prune_expired_sessions'],
      websocketEvents: ['session_revoked'],
      dependencies: [],
      dependents: ['users', 'roles', 'audit_logs', 'commands'],
      status: 'Ready'
    },
    {
      id: 'users',
      name: 'users',
      layer: 'core',
      description: 'User profile management, operator directories, and contact coordinates.',
      models: ['UserProfile', 'OperatorDirectory'],
      tables: ['smrod_user_profiles'],
      services: ['sync_supabase_profile()', 'update_operator_contact()'],
      endpoints: ['GET /api/v1/users/', 'POST /api/v1/users/', 'PATCH /api/v1/users/{id}/'],
      celeryTasks: ['sync_supabase_auth_users'],
      websocketEvents: ['user_status_changed'],
      dependencies: ['accounts', 'roles'],
      dependents: ['audit_logs', 'notifications'],
      status: 'Ready'
    },
    {
      id: 'roles',
      name: 'roles',
      layer: 'core',
      description: 'Role-based access control (Super Admin, Operations, Support, Viewer) and granular permissions.',
      models: ['Role', 'Permission', 'RoleAssignment'],
      tables: ['smrod_roles', 'smrod_role_permissions'],
      services: ['has_permission()', 'enforce_role_gate()'],
      endpoints: ['GET /api/v1/roles/', 'POST /api/v1/roles/assign/'],
      celeryTasks: [],
      websocketEvents: ['role_permission_updated'],
      dependencies: ['accounts'],
      dependents: ['users', 'commands', 'audit_logs'],
      status: 'Ready'
    },
    {
      id: 'vehicles',
      name: 'vehicles',
      layer: 'core',
      description: 'Vehicle registry, VIN, license plate, make, model, owner, and active operational status.',
      models: ['Vehicle', 'VehicleDocument', 'VehicleStatusHistory'],
      tables: ['smrod_vehicles', 'smrod_vehicle_status_logs'],
      services: ['register_vehicle()', 'update_operational_state()', 'pair_vscu_device()'],
      endpoints: ['GET /api/v1/vehicles/', 'POST /api/v1/vehicles/', 'GET /api/v1/vehicles/{id}/', 'PATCH /api/v1/vehicles/{id}/'],
      celeryTasks: ['recalculate_daily_mileage', 'check_vehicle_health_status'],
      websocketEvents: ['vehicle_status_changed', 'vehicle_speed_updated'],
      dependencies: ['accounts', 'devices'],
      dependents: ['telemetry', 'locations', 'security_events', 'commands', 'geofences', 'risk_scoring'],
      status: 'Ready'
    },
    {
      id: 'devices',
      name: 'devices',
      layer: 'core',
      description: 'VSCU hardware registry, 15-digit Quectel IMEIs, serial numbers, mTLS certs, and firmware configurations.',
      models: ['VSCUDevice', 'DeviceCertificate', 'DeviceDiagnosticsLog'],
      tables: ['smrod_vscu_devices', 'smrod_device_certs', 'smrod_diagnostics_logs'],
      services: ['provision_vscu()', 'verify_mtls_cert()', 'push_firmware_config()', 'run_device_diagnostics()'],
      endpoints: ['GET /api/v1/devices/', 'POST /api/v1/devices/', 'POST /api/v1/devices/{id}/diagnostics/', 'PATCH /api/v1/devices/{id}/config/'],
      celeryTasks: ['heartbeat_watchdog', 'check_mtls_expiry'],
      websocketEvents: ['device_online', 'device_offline', 'diagnostics_completed'],
      dependencies: ['accounts'],
      dependents: ['vehicles', 'telemetry', 'commands'],
      status: 'Ready'
    },
    {
      id: 'telemetry',
      name: 'telemetry',
      layer: 'ingestion',
      description: 'High-frequency telemetry ingestion from ESP32-S3 (GNSS, IMU 6-axis, battery voltage, temperature).',
      models: ['TelemetryReading', 'IMUImpactRecord'],
      tables: ['smrod_telemetry_readings', 'smrod_imu_records'],
      services: ['process_mqtt_packet()', 'validate_telemetry_checksum()', 'detect_displacement()'],
      endpoints: ['POST /api/v1/telemetry/ingest/', 'GET /api/v1/telemetry/latest/{vehicle_id}/'],
      celeryTasks: ['ingest_telemetry_batch', 'archive_historical_telemetry'],
      websocketEvents: ['telemetry_stream', 'displacement_detected'],
      dependencies: ['devices', 'vehicles'],
      dependents: ['locations', 'security_events', 'risk_scoring', 'geofences'],
      status: 'Ready'
    },
    {
      id: 'locations',
      name: 'locations',
      layer: 'ingestion',
      description: 'Spatial breadcrumbs, trip reconstruction, reverse geocoding, and PostGIS trajectory queries.',
      models: ['LocationPoint', 'TripHistory'],
      tables: ['smrod_location_points', 'smrod_trips'],
      services: ['record_breadcrumb()', 'reconstruct_trip()', 'reverse_geocode_coordinates()'],
      endpoints: ['GET /api/v1/locations/history/{vehicle_id}/', 'GET /api/v1/locations/trips/{vehicle_id}/'],
      celeryTasks: ['consolidate_ended_trips', 'cleanup_raw_points'],
      websocketEvents: ['vehicle_moved'],
      dependencies: ['telemetry', 'vehicles'],
      dependents: ['geofences', 'dashboard'],
      status: 'Ready'
    },
    {
      id: 'geofences',
      name: 'geofences',
      layer: 'ingestion',
      description: 'Spatial perimeters (circular & polygon safe zones), speed limits, and entry/exit breach detectors.',
      models: ['Geofence', 'GeofenceBreachLog', 'VehicleGeofenceAssignment'],
      tables: ['smrod_geofences', 'smrod_geofence_breaches'],
      services: ['evaluate_coordinate_containment()', 'trigger_geofence_breach()'],
      endpoints: ['GET /api/v1/geofences/', 'POST /api/v1/geofences/', 'POST /api/v1/geofences/{id}/toggle/'],
      celeryTasks: ['evaluate_all_active_geofences'],
      websocketEvents: ['geofence_breach_alert', 'geofence_entry'],
      dependencies: ['vehicles', 'locations'],
      dependents: ['security_events', 'notifications', 'risk_scoring'],
      status: 'Ready'
    },
    {
      id: 'security_events',
      name: 'security_events',
      layer: 'security',
      description: 'Security incident triage engine: crash detection, tampering, towing, power loss, and lifecycle states.',
      models: ['SecurityIncident', 'IncidentResolutionLog'],
      tables: ['smrod_security_events', 'smrod_event_resolutions'],
      services: ['create_security_incident()', 'triage_incident()', 'resolve_incident()'],
      endpoints: ['GET /api/v1/security-events/', 'POST /api/v1/security-events/{id}/triage/', 'POST /api/v1/security-events/{id}/resolve/'],
      celeryTasks: ['escalate_unacknowledged_critical_events'],
      websocketEvents: ['security_incident_created', 'incident_status_changed'],
      dependencies: ['vehicles', 'devices', 'telemetry', 'geofences'],
      dependents: ['risk_scoring', 'commands', 'emergencies', 'notifications', 'dashboard'],
      status: 'Ready'
    },
    {
      id: 'risk_scoring',
      name: 'risk_scoring',
      layer: 'security',
      description: 'Dynamic threat evaluation weighting sensor shock (G-force), speed anomalies, and curfew parameters.',
      models: ['RiskScoreSnapshot', 'RiskRuleParameter'],
      tables: ['smrod_risk_scores', 'smrod_risk_rules'],
      services: ['calculate_risk_score()', 'evaluate_heuristic_threats()'],
      endpoints: ['GET /api/v1/risk-scoring/{vehicle_id}/', 'POST /api/v1/risk-scoring/recalculate/'],
      celeryTasks: ['recalculate_fleet_risk_scores'],
      websocketEvents: ['risk_score_escalated'],
      dependencies: ['telemetry', 'security_events', 'geofences'],
      dependents: ['dashboard', 'notifications'],
      status: 'Ready'
    },
    {
      id: 'commands',
      name: 'commands',
      layer: 'security',
      description: 'Remote command dispatcher with speed <= 5 km/h safety gate, idempotency keys, and signed MQTT dispatch.',
      models: ['RemoteCommandLog', 'CommandAuthorizationPolicy'],
      tables: ['smrod_remote_commands', 'smrod_command_policies'],
      services: ['dispatch_immobilize_command()', 'dispatch_mobilize_command()', 'dispatch_siren_command()', 'validate_speed_gate()'],
      endpoints: ['GET /api/v1/commands/', 'POST /api/v1/commands/immobilize/', 'POST /api/v1/commands/mobilize/', 'POST /api/v1/commands/siren/'],
      celeryTasks: ['monitor_command_ack_timeout'],
      websocketEvents: ['command_dispatched', 'command_executed', 'command_failed'],
      dependencies: ['vehicles', 'devices', 'accounts', 'roles'],
      dependents: ['emergencies', 'audit_logs', 'notifications'],
      status: 'Ready'
    },
    {
      id: 'emergencies',
      name: 'emergencies',
      layer: 'security',
      description: 'Crisis lockdown protocols, all-fleet siren broadcasts, and rapid law enforcement dispatch.',
      models: ['EmergencyIncident', 'LockdownOrder'],
      tables: ['smrod_emergency_orders'],
      services: ['execute_fleet_lockdown()', 'broadcast_hazard_siren()', 'generate_police_incident_pack()'],
      endpoints: ['POST /api/v1/emergencies/lockdown/', 'POST /api/v1/emergencies/broadcast-siren/'],
      celeryTasks: ['dispatch_emergency_broadcast_batches'],
      websocketEvents: ['emergency_crisis_broadcast'],
      dependencies: ['commands', 'vehicles', 'security_events'],
      dependents: ['notifications', 'audit_logs'],
      status: 'Ready'
    },
    {
      id: 'notifications',
      name: 'notifications',
      layer: 'delivery',
      description: 'Multi-channel alert dispatch via Twilio SMS, Firebase Cloud Messaging (FCM), and Django Channels WebSockets.',
      models: ['NotificationLog', 'NotificationPreference'],
      tables: ['smrod_notification_logs', 'smrod_notification_preferences'],
      services: ['send_sms_alert()', 'push_fcm_notification()', 'broadcast_websocket_alert()'],
      endpoints: ['GET /api/v1/notifications/', 'POST /api/v1/notifications/{id}/acknowledge/', 'POST /api/v1/notifications/batch-acknowledge/'],
      celeryTasks: ['dispatch_queued_sms', 'retry_failed_push_notifications'],
      websocketEvents: ['notification_received', 'alert_acknowledged'],
      dependencies: ['security_events', 'geofences', 'commands', 'users'],
      dependents: ['audit_logs', 'dashboard'],
      status: 'Ready'
    },
    {
      id: 'audit_logs',
      name: 'audit_logs',
      layer: 'delivery',
      description: 'Cryptographically verifiable, immutable audit trail for operator actions, remote commands, and logins.',
      models: ['AuditTrailRecord'],
      tables: ['smrod_audit_logs'],
      services: ['record_audit_event()', 'verify_audit_integrity()', 'export_compliance_report()'],
      endpoints: ['GET /api/v1/audit-logs/', 'GET /api/v1/audit-logs/export/'],
      celeryTasks: ['archive_audit_trail_partitions'],
      websocketEvents: [],
      dependencies: ['accounts', 'users', 'roles', 'commands'],
      dependents: ['dashboard'],
      status: 'Ready'
    },
    {
      id: 'dashboard',
      name: 'dashboard',
      layer: 'delivery',
      description: 'Aggregates metrics for the WDS-001 administrative overview (moving vehicles, uptime, active incidents).',
      models: ['DashboardMetricCache'],
      tables: ['smrod_dashboard_cache'],
      services: ['compute_wds001_metrics()', 'get_cached_fleet_summary()'],
      endpoints: ['GET /api/v1/dashboard/overview/', 'GET /api/v1/dashboard/stream/'],
      celeryTasks: ['refresh_dashboard_metrics_cache'],
      websocketEvents: ['dashboard_stats_updated'],
      dependencies: ['vehicles', 'devices', 'security_events', 'telemetry', 'locations'],
      dependents: [],
      status: 'Ready'
    }
  ];

  const selectedModule = djangoModules.find((m) => m.id === selectedModuleId) || djangoModules[3];

  const filteredModules = djangoModules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchModule.toLowerCase()) ||
      m.description.toLowerCase().includes(searchModule.toLowerCase());
    const matchesLayer = filterLayer === 'all' || m.layer === filterLayer;
    return matchesSearch && matchesLayer;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Architecture &amp; Engineering Blueprint
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0a66c2]">
              Django REST Framework Modular Monolith
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Backend Foundation &amp; Dependency Graph
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Interactive architecture visualizer and developer implementation guide for the 15 independent Django applications, database schemas, and IoT event pipelines.
          </p>
        </div>

        {/* Stack Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900 text-white shadow-xs">
            Django 5.1
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[#0a66c2] text-white shadow-xs">
            DRF
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-700 text-white shadow-xs">
            PostgreSQL 16
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-600 text-white shadow-xs">
            MQTT TLS 1.3
          </span>
        </div>
      </div>

      {/* 2. Primary Navigation Subtabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'graph'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Dependency Graph (DAG)</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>15 Modules Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flow'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>IoT &amp; Command Data Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Developer Implementation Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'blueprints'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Source Code Blueprints</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
          Modular Monolith / Clean Boundaries
        </div>
      </div>

      {/* 3. VIEW TAB: DEPENDENCY GRAPH (DAG) */}
      {activeTab === 'graph' && (
        <div className="space-y-6">
          {/* Top Layer Filter Strip */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-400" />
                  <span>Layered Modular Monolith Architecture</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any module to inspect its upstream dependencies, downstream dependents, models, and endpoints.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Core
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950 text-amber-300 border border-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Ingestion
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950 text-red-300 border border-red-800">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Security
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Delivery
                </span>
              </div>
            </div>

            {/* Visual Layers Stack */}
            <div className="space-y-4 pt-2">
              {/* Layer 1: Core Domain */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-300 font-bold uppercase tracking-wider">
                  <span>Layer 1: Core Domain &amp; Identity</span>
                  <span className="text-[11px] font-mono text-slate-400">PostgreSQL Relational Storage</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {djangoModules.filter((m) => m.layer === 'core').map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedModuleId === mod.id
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-300/40'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">{mod.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{mod.models.length} Models</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer 2: Ingestion & Spatial */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
                  <span>Layer 2: IoT Telemetry &amp; Spatial Engine</span>
                  <span className="text-[11px] font-mono text-slate-400">MQTT over TLS 1.3 &amp; PostGIS</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {djangoModules.filter((m) => m.layer === 'ingestion').map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedModuleId === mod.id
                          ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-2 ring-amber-300/40'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">{mod.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{mod.models.length} Models</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer 3: Security & Commands */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-red-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-red-300 font-bold uppercase tracking-wider">
                  <span>Layer 3: Security Triage &amp; Remote Commands</span>
                  <span className="text-[11px] font-mono text-slate-400">Speed &le; 5 km/h Safety Gate</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {djangoModules.filter((m) => m.layer === 'security').map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedModuleId === mod.id
                          ? 'bg-red-600 text-white border-red-400 shadow-md ring-2 ring-red-300/40'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-red-500/50'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">{mod.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{mod.models.length} Models</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer 4: Delivery & Analytics */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  <span>Layer 4: Delivery, Audit, &amp; Analytics</span>
                  <span className="text-[11px] font-mono text-slate-400">WebSockets, Celery &amp; Redis</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {djangoModules.filter((m) => m.layer === 'delivery').map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedModuleId === mod.id
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs">{mod.name}</div>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{mod.models.length} Models</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Selected Module Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a66c2] flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-mono font-bold text-slate-900">
                      apps.{selectedModule.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {selectedModule.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedModule.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Path:</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                  backend/apps/{selectedModule.name}/
                </span>
              </div>
            </div>

            {/* Module Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Models & DDL */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Models &amp; DDL Tables</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedModule.models.length} models</span>
                </div>
                <div className="space-y-1.5">
                  {selectedModule.models.map((mod, i) => (
                    <div key={mod} className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                      <div className="font-bold text-slate-800">{mod}</div>
                      <div className="text-[10px] text-slate-400">Table: {selectedModule.tables[i] || `smrod_${selectedModule.name}_${mod.toLowerCase()}`}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services & Business Logic */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>Domain Services</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">services.py</span>
                </div>
                <div className="space-y-1.5">
                  {selectedModule.services.map((srv) => (
                    <div key={srv} className="p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
                      {srv}
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoints & DRF */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-600" />
                    <span>REST API Endpoints</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">views.py / urls.py</span>
                </div>
                <div className="space-y-1.5">
                  {selectedModule.endpoints.map((ep) => (
                    <div key={ep} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                      {ep}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inbound & Outbound Dependencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/60 space-y-2">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 rotate-180" />
                  <span>Upstream Dependencies (This module imports):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedModule.dependencies.length > 0 ? (
                    selectedModule.dependencies.map((dep) => (
                      <button
                        key={dep}
                        onClick={() => setSelectedModuleId(dep)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-100 rounded-lg text-xs font-mono font-bold text-blue-800 border border-blue-200 transition-colors"
                      >
                        apps.{dep}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None (Foundation Root Module)</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 space-y-2">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Downstream Dependents (Other modules that import this):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedModule.dependents.length > 0 ? (
                    selectedModule.dependents.map((dep) => (
                      <button
                        key={dep}
                        onClick={() => setSelectedModuleId(dep)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 rounded-lg text-xs font-mono font-bold text-emerald-800 border border-emerald-200 transition-colors"
                      >
                        apps.{dep}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Leaf Consumer Node</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW TAB: 15 MODULES MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchModule}
                onChange={(e) => setSearchModule(e.target.value)}
                placeholder="Search module name or description..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['all', 'core', 'ingestion', 'security', 'delivery'].map((l) => (
                <button
                  key={l}
                  onClick={() => setFilterLayer(l)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                    filterLayer === l
                      ? 'bg-[#0a66c2] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {l === 'all' ? 'All 15 Apps' : l}
                </button>
              ))}
            </div>
          </div>

          {/* Modules Table Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedModuleId(m.id)}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${
                  selectedModuleId === m.id ? 'border-[#0a66c2] ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      apps.{m.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.layer === 'core'
                          ? 'bg-blue-100 text-blue-800'
                          : m.layer === 'ingestion'
                          ? 'bg-amber-100 text-amber-800'
                          : m.layer === 'security'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {m.layer}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {m.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div>
                      Models:{' '}
                      <span className="font-mono font-semibold text-slate-800">
                        {m.models.join(', ')}
                      </span>
                    </div>
                    <div>
                      Services:{' '}
                      <span className="font-mono text-slate-700 truncate block">
                        {m.services.join(' · ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{m.endpoints.length} endpoints</span>
                  <span className="text-[#0a66c2] font-semibold flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. VIEW TAB: IOT & COMMAND DATA FLOW */}
      {activeTab === 'flow' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              End-to-End IoT Telemetry &amp; Remote Command Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict separation between end-user authentication (Supabase Auth JWT) and hardware device communication (mTLS X.509 certificates).
            </p>
          </div>

          {/* Flow Steps Timeline */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">ESP32-S3 Hardware Sensor Polling</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-100 text-blue-800">Edge Device</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every 5–10s, the ESP32-S3 queries the GNSS module (L1/L5 NMEA sentences), 6-axis IMU (gyroscope &amp; accelerometer for impact &gt; 3.5g), and battery ADC voltage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">MQTT over TLS 1.3 Transport (mTLS)</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-amber-100 text-amber-800">Port 8883</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Device authenticates using its embedded client X.509 certificate to EMQX / Mosquitto at <code className="font-mono text-slate-800">mqtt.smrod.ai:8883</code>. Telemetry published to <code className="font-mono text-slate-800">smrod/v1/devices/{'{uid}'}/telemetry</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Celery Ingestion Worker &amp; PostGIS Geofencing</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800">Asynchronous</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Celery worker dequeues MQTT packets, computes speed deltas, stores time-series points in PostgreSQL, and verifies containment against active geofence polygons.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                4
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Security Incident Trigger &amp; Dynamic Risk Scoring</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-red-100 text-red-800">Threat Detection</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If an unauthorized tow, battery disconnect, or crash &gt; 3.5g is detected, <code className="font-mono text-slate-800">apps.security_events</code> logs an incident, and <code className="font-mono text-slate-800">apps.risk_scoring</code> recalculates the vehicle threat score (0–100).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                5
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Safety-Gated Remote Immobilization Protocol</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800">Safety Interlock</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When an operator commands engine shutdown, <code className="font-mono text-slate-800">apps.commands.services</code> strictly verifies <strong className="text-slate-900">speed &le; 5.0 km/h</strong>. If satisfied, an idempotency-keyed MQTT packet is published to trigger the physical fuel cutoff relay.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW TAB: DEVELOPER IMPLEMENTATION GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* CLI Scaffolding Quickstart Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Django Backend CLI Scaffolding Runbook</h3>
              </div>
              <button
                onClick={() => copyCode('cli-scaffold', `python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000
celery -A config worker -l info -Q telemetry,notifications,commands`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                {copiedSnippet === 'cli-scaffold' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'cli-scaffold' ? 'Copied CLI' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
{`# 1. Environment initialization
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

# 2. Database migrations (PostgreSQL)
python backend/manage.py makemigrations accounts users roles vehicles devices telemetry locations security_events commands geofences emergencies notifications risk_scoring audit_logs dashboard
python backend/manage.py migrate

# 3. Launch Development Services
python backend/manage.py runserver 0.0.0.0:8000
celery -A config worker -l info -Q telemetry,notifications,commands
python -m apps.telemetry.mqtt_consumer`}
            </pre>
          </div>

          {/* 5 Implementation Phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-[#0a66c2]">
                  Phase 1
                </span>
                <span className="text-xs text-slate-400 font-mono">Week 1–2</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Core Foundation &amp; Supabase Auth
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Configure PyJWT with Supabase JWT Secret</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Provision PostgreSQL schema &amp; user roles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Setup CORS &amp; OpenAPI drf-spectacular schema</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                  Phase 2
                </span>
                <span className="text-xs text-slate-400 font-mono">Week 3–4</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Fleet Registry &amp; VSCU Hardware
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Implement 15-digit Quectel IMEI indexing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Build vehicle-to-device 1:1 pairing services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hardware diagnostics inspection endpoints</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                  Phase 3
                </span>
                <span className="text-xs text-slate-400 font-mono">Week 5–6</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                MQTT Ingestion &amp; Spatial Engine
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>mTLS X.509 MQTT subscriber daemon</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>PostGIS ST_DWithin geofence evaluation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Time-series breadcrumb compression &amp; trips</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-800">
                  Phase 4
                </span>
                <span className="text-xs text-slate-400 font-mono">Week 7–8</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Security Triage &amp; Remote Commands
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Speed &le; 5.0 km/h safety gate verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Idempotency key enforcement on all commands</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Crash shock sensor &gt; 3.5g automated triage</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800">
                  Phase 5
                </span>
                <span className="text-xs text-slate-400 font-mono">Week 9–10</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Multi-Channel Notifications &amp; WebSockets
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Django Channels Redis WebSocket broadcaster</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Twilio SMS &amp; Firebase push alert relays</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WDS-001 caching &amp; immutable audit hashing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 7. VIEW TAB: SOURCE CODE BLUEPRINTS */}
      {activeTab === 'blueprints' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedModuleId('accounts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                  selectedModuleId === 'accounts' ? 'bg-[#0a66c2] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                apps/accounts/authentication.py
              </button>
              <button
                onClick={() => setSelectedModuleId('devices')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                  selectedModuleId === 'devices' ? 'bg-[#0a66c2] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                apps/devices/models.py
              </button>
              <button
                onClick={() => setSelectedModuleId('commands')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                  selectedModuleId === 'commands' ? 'bg-[#0a66c2] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                apps/commands/services.py
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono">Production Ready Python Code</span>
          </div>

          <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mono text-xs text-blue-400">
                backend/apps/{selectedModuleId === 'accounts' ? 'accounts/authentication.py' : selectedModuleId === 'devices' ? 'devices/models.py' : 'commands/services.py'}
              </span>
              <button
                onClick={() => copyCode('blueprint-view', selectedModuleId === 'accounts'
                  ? `import jwt\nfrom rest_framework import authentication, exceptions\nclass SupabaseJWTAuthentication(authentication.BaseAuthentication):\n    # verified against settings.SUPABASE_JWT_SECRET`
                  : `class VSCUDevice(models.Model):\n    serial_number = models.CharField(max_length=40, unique=True)\n    imei = models.CharField(max_length=15, unique=True)`
                )}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                {copiedSnippet === 'blueprint-view' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed py-2">
              {selectedModuleId === 'accounts' && `"""
apps.accounts.authentication
Validates incoming Bearer JWT tokens issued by Supabase Auth.
Separates administrative end-user identity from IoT device authentication.
"""
import jwt
from django.conf import settings
from rest_framework import authentication, exceptions

class SupabaseUser:
    def __init__(self, payload: dict):
        self.id = payload.get('sub')
        self.email = payload.get('email', '')
        self.smrod_role = payload.get('app_metadata', {}).get('role', 'viewer')
        self.is_authenticated = True

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={'verify_aud': False}
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Supabase JWT token expired')
        except jwt.InvalidTokenError as err:
            raise exceptions.AuthenticationFailed(f'Invalid Supabase JWT: {err}')
        return (SupabaseUser(payload), token)`}

              {selectedModuleId === 'devices' && `"""
apps.devices.models
Tracks VSCU (Vehicle Security Control Unit) hardware records.
Stores 15-digit Quectel LTE Cat-1 IMEIs, mTLS certs, and telemetry diagnostics.
"""
import uuid
from django.db import models
from apps.vehicles.models import Vehicle

class VSCUDevice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    serial_number = models.CharField(max_length=40, unique=True, db_index=True)
    imei = models.CharField(max_length=15, unique=True, db_index=True)
    hardware_uid = models.CharField(max_length=50, unique=True)
    mac_address = models.CharField(max_length=20)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='vscu')
    connection_status = models.CharField(max_length=20, default='offline')
    firmware_version = models.CharField(max_length=30, default='v2.4.1-smrod-prod')
    battery_level = models.PositiveSmallIntegerField(default=100)
    battery_voltage = models.FloatField(default=4.2)
    lte_signal_rssi = models.IntegerField(default=-70)
    gnss_fix = models.CharField(max_length=20, default='3D_FIX')
    gnss_satellites = models.PositiveSmallIntegerField(default=12)`}

              {selectedModuleId === 'commands' && `"""
apps.commands.services
Dispatches remote commands (immobilization, mobilization, siren) to VSCU devices.
Enforces safety checks: Vehicle speed must be <= 5.0 km/h to trigger fuel cutoff.
"""
import json
import logging
import paho.mqtt.client as mqtt
from rest_framework.exceptions import ValidationError

def dispatch_immobilize_command(vehicle, operator_user, idempotency_key: str):
    # Safety Check: Highway protection interlock
    if vehicle.current_speed > 5.0:
        raise ValidationError(
            f"Safety Gate Rejected: Vehicle speed ({vehicle.current_speed} km/h) exceeds safe threshold (<= 5.0 km/h)."
        )
    if not hasattr(vehicle, 'vscu_device') or not vehicle.vscu_device:
        raise ValidationError("Vehicle has no active VSCU hardware paired.")

    payload = {
        "command": "IMMOBILIZE_FUEL_RELAY",
        "idempotency_key": idempotency_key,
        "target_vscu_serial": vehicle.vscu_device.serial_number,
        "operator_id": str(operator_user.id),
        "operator_role": operator_user.smrod_role,
        "safety_verified": True
    }
    # Publish via MQTT TLS 1.3
    # ...`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
