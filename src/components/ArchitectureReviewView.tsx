import React, { useState } from 'react';
import {
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  Radio,
  FileCode,
  GitBranch,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Server,
  Zap,
  Activity,
  ShieldAlert
} from 'lucide-react';

export const ArchitectureReviewView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Official Architecture Specification &amp; System Review
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            SMROD System Architecture &amp; Engineering Plan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete architectural blueprint integrating SAS-001 requirements, physical ESP32-S3 hardware VSCU schematics, Supabase, and Flutter.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>V2.4 Spec Ready</span>
          </span>
        </div>
      </div>

      {/* Deliverables Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {[
          { id: 1, title: '1. System Topo', icon: Server },
          { id: 2, title: '2. Django Apps', icon: Layers },
          { id: 3, title: '3. Admin Web', icon: Terminal },
          { id: 4, title: '4. DB Schema', icon: Database },
          { id: 5, title: '5. Auth & RBAC', icon: Lock },
          { id: 6, title: '6. API Spec', icon: FileCode },
          { id: 7, title: '7. Real-Time', icon: Radio },
          { id: 8, title: '8. Roadmap', icon: GitBranch },
          { id: 9, title: '9. Hardware Spec', icon: Cpu }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-indigo-900 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: COMPLETE SYSTEM ARCHITECTURE */}
      {activeSection === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              1. Complete System Architecture (End-to-End Topology)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dual-layer decoupled architecture separating IoT device telemetry (MQTT/TLS 1.3) from User Operations (HTTPS/WebSockets).
            </p>
          </div>

          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto">
            <pre>{`========================================================================================
                          SMROD PLATFORM ARCHITECTURE TOPOLOGY
========================================================================================

    [ ESP32-S3 IoT Hardware Devices ] (LTE Cat-1 / GNSS / IMU Sensors)
                 │
                 │ Mutual TLS (mTLS) X.509 Device Certificates
                 ▼ (Port 8883)
    ┌────────────────────────────────────────────────────────┐
    │          EMQX / HiveMQ Enterprise MQTT Broker          │
    │   Topics: smrod/v1/devices/{hw_uid}/telemetry          │
    │           smrod/v1/devices/{hw_uid}/events             │
    │           smrod/v1/devices/{hw_uid}/cmd                │
    └──────────────────────────┬─────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
    ┌────────────────────────┐           ┌────────────────────────┐
    │  Paho MQTT Ingestion   │           │ Redis Message Broker   │
    │  Worker Service        │           │ & Celery Task Queue    │
    └───────────┬────────────┘           └───────────┬────────────┘
                │                                     │
                ▼                                     ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                  DJANGO BACKEND (MODULAR MONOLITH)              │
    │  - Django REST Framework (DRF)                                  │
    │  - Django Channels ASGI (WebSockets)                            │
    │  - PyJWT Supabase Access Token Validator                        │
    │  - Application-level RBAC & Object Permissions                  │
    └───────────┬─────────────────────────────────┬───────────────────┘
                │                                 │
                ▼                                 ▼
    ┌────────────────────────┐           ┌────────────────────────────┐
    │  PostgreSQL Database   │           │ Supabase Auth (Identity)   │
    │  - Relational Models   │           │ - User registration/login  │
    │  - Timescale/Partitions│           │ - Issues short-lived JWTs  │
    │  - Audit Trail & Logs  │           │ - Password resets & 2FA    │
    └────────────────────────┘           └─────────────┬──────────────┘
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   ▼                                       ▼
                       ┌────────────────────────┐             ┌────────────────────────┐
                       │ SMROD Admin Web App    │             │ Flutter Mobile App     │
                       │ (React + TS + Tailwind)│             │ (Vehicle Owner Client) │
                       │ HTTPS + WSS Live Feeds │             │ HTTPS + WSS Live Feeds │
                       └────────────────────────┘             └────────────────────────┘`}</pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>IoT Edge Layer</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ESP32-S3 microcontroller running FreeRTOS with Quectel EG915N LTE modem, multi-constellation GNSS, and 6-axis IMU for crash/tilt detection.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Modular Django Core</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Replaces the original NestJS proposal with a high-throughput Django modular monolith. Owns business logic, vehicle states, and relay immobilization.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Identity &amp; Security Layer</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Supabase Auth handles user identity tokens; Django verifies signatures with PyJWT and enforces strict server-side RBAC on every endpoint.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: BACKEND MODULE ARCHITECTURE */}
      {activeSection === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              2. Backend Module Architecture (15 Independent Django Apps)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Strict separation of concerns with dedicated models, serializers, views, permissions, and test suites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'accounts', desc: 'Supabase JWT verification middleware, token claims, and session profile hydration.' },
              { name: 'users', desc: 'Django user records linked to Supabase UUIDs, operator contact details, and department.' },
              { name: 'roles', desc: 'Role-Based Access Control matrix, permission assignment, and object-level permission guards.' },
              { name: 'vehicles', desc: 'Vehicle registry, plate numbers, VIN, make/model, status, and immobilization latch.' },
              { name: 'devices', desc: 'ESP32-S3 hardware UID, MAC address, mTLS certificate serials, firmware version, and battery.' },
              { name: 'telemetry', desc: 'High-frequency time-series GNSS coordinates, Doppler speed, battery line voltage, and IMU.' },
              { name: 'locations', desc: 'Spatial GIS location history, breadcrumb point clustering, and reverse geocoding.' },
              { name: 'security_events', desc: 'Unauthorized movement, crash detection, battery disconnect, and incident lifecycle.' },
              { name: 'commands', desc: 'Signed, time-limited MQTT directives (immobilize, siren, ping) with idempotency keys.' },
              { name: 'geofences', desc: 'Circular/polygonal safe zones, speed corridor boundaries, and entry/exit breach triggers.' },
              { name: 'emergencies', desc: 'SOS incident dispatcher, emergency escalation workflows, and all-fleet alert broadcast.' },
              { name: 'notifications', desc: 'Push notification broker (FCM) and SMS fallback for critical security alerts.' },
              { name: 'risk_scoring', desc: 'Multi-variable risk algorithm weighing IMU impacts, speed delta, and geofence state.' },
              { name: 'audit_logs', desc: 'Cryptographically audited immutable action log recording actor, IP, timestamp, and details.' },
              { name: 'dashboard', desc: 'Operational KPI aggregation, fleet status rollups, and WebSocket event streams.' }
            ].map((app, idx) => (
              <div key={app.name} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700">apps.{app.name}</span>
                  <span className="text-[11px] font-mono text-slate-400">0{idx + 1}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ADMIN FRONTEND ARCHITECTURE */}
      {activeSection === 3 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              3. Administrative Frontend Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Modular React + TypeScript SPA on Vite adhering to the Universal Frontend Design Constitution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Design &amp; UI Principles</h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">1.</span>
                  <span><strong>Zero-Pill Metadata:</strong> Information rendered cleanly with unboxed text and typographic separators (·) rather than cluttering capsules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">2.</span>
                  <span><strong>Strict 3-Zone Top Bar:</strong> Wordmark Brand &rarr; Concise Nav Links &rarr; Single Primary CTA (Role/Emergency).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">3.</span>
                  <span><strong>60-30-10 Palette:</strong> 60% neutral canvas (slate-50/white), 30% structural surfaces (slate-900 dark map), 10% intentional action accents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">4.</span>
                  <span><strong>Tabular Numerals:</strong> Telemetry, coordinates, latency, and speeds rendered in <code>font-mono tabular-nums</code> for precise alignment.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">State &amp; Communication Pipeline</h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">&bull;</span>
                  <span><strong>WebSocket Live Gateway:</strong> Subscribes to <code>/ws/fleet/telemetry/</code> for 1Hz GPS breadcrumb updates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">&bull;</span>
                  <span><strong>Optimistic UI Mutation:</strong> State updates instantaneously with rollback on HTTP 4xx/5xx responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 shrink-0">&bull;</span>
                  <span><strong>Safety Interlocks:</strong> Multi-step modal confirmations on high-risk operations (e.g. Remote Engine Immobilization).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: DATABASE SCHEMA & RELATIONSHIPS */}
      {activeSection === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              4. Relational Database Schema &amp; Data Model (PostgreSQL)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fully normalized relational tables with indexes, foreign key constraints, and time-series partitioning.
            </p>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto">
            <pre>{`-- 1. User Profiles (Linked to Supabase Auth UUID)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid UUID UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'viewer', -- super_admin, admin, operations, support, viewer
    department VARCHAR(120),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vehicles Registry
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(40),
    owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance
    security_status VARCHAR(20) DEFAULT 'normal', -- normal, warning, critical
    is_immobilized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

-- 3. ESP32-S3 IoT Hardware Units
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hardware_uid VARCHAR(64) UNIQUE NOT NULL,
    mac_address VARCHAR(17) UNIQUE NOT NULL,
    vehicle_id UUID UNIQUE REFERENCES vehicles(id) ON DELETE SET NULL,
    connection_status VARCHAR(20) DEFAULT 'offline',
    firmware_version VARCHAR(32) DEFAULT 'v2.4.1-smrod-prod',
    client_cert_serial VARCHAR(128) NOT NULL,
    battery_level SMALLINT DEFAULT 100,
    lte_signal_rssi SMALLINT DEFAULT -70,
    last_ping_time TIMESTAMPTZ
);
CREATE INDEX idx_devices_hw_uid ON devices(hardware_uid);

-- 4. High-Frequency Telemetry Records (Partitioned by week/month)
CREATE TABLE telemetry_records (
    id BIGSERIAL,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh REAL NOT NULL,
    heading_deg REAL NOT NULL,
    altitude_m REAL,
    battery_voltage REAL NOT NULL,
    imu_g_force REAL DEFAULT 1.0,
    gnss_satellites SMALLINT DEFAULT 12,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- 5. Remote Commands & Safety Interlocks
CREATE TABLE remote_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    issued_by_id UUID REFERENCES user_profiles(id),
    command_type VARCHAR(32) NOT NULL, -- immobilize, mobilize, trigger_alarm, ping
    status VARCHAR(20) DEFAULT 'queued', -- queued, dispatched, acknowledged, executed, failed
    safety_check_passed BOOLEAN NOT NULL,
    delivery_latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>
      )}

      {/* SECTION 5: AUTHENTICATION & AUTHORIZATION DESIGN */}
      {activeSection === 5 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              5. Authentication and Authorization Design
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Separation of Identity (Supabase Auth) from Authorization &amp; Business Rules (Django RBAC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">JWT Authentication Flow</h3>
              <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed">
                <li>Operator signs into Admin Web using Supabase Auth credentials.</li>
                <li>Supabase verifies credentials and returns a short-lived signed JWT access token.</li>
                <li>Web client attaches token to the <code>Authorization: Bearer &lt;token&gt;</code> header on all REST/WebSocket requests.</li>
                <li>Django custom middleware (<code>SupabaseJWTAuthentication</code>) validates token signature with <code>SUPABASE_JWT_SECRET</code>.</li>
                <li>Django maps the verified <code>sub</code> claim to a local <code>UserProfile</code> record.</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Server-Side Authorization Rules</h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li><strong>Never Trust Frontend Claims:</strong> Role labels in JWT or frontend state are ignored during permission checks.</li>
                <li><strong>Django Permission Classes:</strong> Protected views inherit from <code>HasRolePermission</code> checking against the database.</li>
                <li><strong>Sensitive Command Authorization:</strong> Remote vehicle immobilization is strictly restricted to <code>super_admin</code> and <code>admin</code> roles.</li>
                <li><strong>Device Auth Separation:</strong> ESP32 devices authenticate exclusively via mTLS certificates on MQTT port 8883, never with Supabase tokens.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: API ENDPOINT SPECIFICATION */}
      {activeSection === 6 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              6. OpenAPI REST API Specification (/api/v1/)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standardized HTTP methods, resource paths, filtering, pagination, and required permissions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Endpoint</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Required Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">GET</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/vehicles/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">List pilot vehicles with filter/search/sort</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Viewer+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-blue-600 font-bold">POST</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/vehicles/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Register new vehicle asset</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Admin+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">GET</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/devices/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">List ESP32-S3 hardware units &amp; health</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Viewer+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">GET</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/security-events/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Query incident feed with severity filters</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Operations+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-blue-600 font-bold">POST</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/commands/immobilize/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Execute engine cutoff (Speed &lt; 5 km/h verified)</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 font-bold text-red-600">Super Admin / Admin</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-blue-600 font-bold">POST</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/commands/alarm/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Trigger vehicle siren and hazard strobe</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Operations+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">GET</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/geofences/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">List spatial boundaries &amp; breach counts</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Viewer+</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">GET</td>
                  <td className="py-2.5 px-3 text-slate-900">/api/v1/audit-logs/</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">Inspect cryptographically signed audit log</td>
                  <td className="py-2.5 px-3 font-sans text-slate-700">Admin+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 7: REAL-TIME COMMUNICATION DESIGN */}
      {activeSection === 7 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              7. Real-Time Communication Design (MQTT + WebSockets)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Separation of IoT edge protocol (MQTT over TLS 1.3) from browser application streams (Django Channels WebSockets).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">MQTT Edge Channel (ESP32-S3)</h3>
              </div>
              <ul className="space-y-1.5 text-slate-700 leading-relaxed font-mono">
                <li>&bull; <code>smrod/v1/devices/{'{hw_uid}'}/telemetry</code> (10s intervals)</li>
                <li>&bull; <code>smrod/v1/devices/{'{hw_uid}'}/events</code> (Immediate QoS 1)</li>
                <li>&bull; <code>smrod/v1/devices/{'{hw_uid}'}/cmd</code> (Commands to device)</li>
                <li>&bull; <code>smrod/v1/devices/{'{hw_uid}'}/ack</code> (Execution receipts)</li>
              </ul>
              <p className="text-slate-500 text-[11px] font-sans">
                Device communicates strictly with the EMQX broker over TLS 1.3 with client X.509 cert authentication. Never exposes HTTP ports.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">WebSockets Channel (Admin Web)</h3>
              </div>
              <ul className="space-y-1.5 text-slate-700 leading-relaxed font-mono">
                <li>&bull; <code>/ws/fleet/live-tracking/</code> (Live GPS vectors &amp; speed)</li>
                <li>&bull; <code>/ws/fleet/security-alerts/</code> (Instant incident popups)</li>
                <li>&bull; <code>/ws/fleet/command-acks/</code> (Real-time command status)</li>
              </ul>
              <p className="text-slate-500 text-[11px] font-sans">
                Django Channels consumes messages from Redis Pub/Sub and dispatches JSON events to authenticated operator browser sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: DEVELOPMENT ROADMAP */}
      {activeSection === 8 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              8. Step-by-Step Development Roadmap (Phased Execution)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Structured rollout covering Django setup, Supabase integration, pilot telemetry, and remote immobilization.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { phase: 'Phase 1', title: 'Django Project Setup & Architecture', priority: 'Critical', desc: 'Initialize modular monolith, PostgreSQL config, Docker environment, and base models.' },
              { phase: 'Phase 2', title: 'Supabase Authentication Integration', priority: 'Critical', desc: 'Implement PyJWT middleware, user profile hydration, and session token verification.' },
              { phase: 'Phase 3', title: 'Roles & Permissions (RBAC)', priority: 'Critical', desc: 'Establish 5-tier role hierarchy and server-side DRF permission classes.' },
              { phase: 'Phase 4', title: 'Vehicle & Device Management', priority: 'High', desc: 'Implement CRUD endpoints, device-to-vehicle pairing, and mTLS certificate registration.' },
              { phase: 'Phase 5', title: 'Telemetry & Location Ingestion', priority: 'High', desc: 'Build MQTT ingestion workers, time-series tables, and GPS coordinate tracking.' },
              { phase: 'Phase 6', title: 'Security Events & Incident Command', priority: 'High', desc: 'Develop IMU impact shock triggers, unauthorized towing alerts, and triage workflow.' },
              { phase: 'Phase 7', title: 'Remote Command Dispatch & Safety Gates', priority: 'High', desc: 'Implement signed vehicle immobilization with speed verification interlocks and audit logs.' },
              { phase: 'Phase 8', title: 'Live Dashboard & WebSockets', priority: 'High', desc: 'Connect Django Channels to Admin Web for live map updates and incident notifications.' }
            ].map((p, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-700">{p.phase}:</span>
                    <span className="font-semibold text-slate-900">{p.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 bg-slate-200 rounded text-slate-700">{p.priority}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{p.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 9: PHYSICAL HARDWARE SPECIFICATION (VSCU ESP32-S3) */}
      {activeSection === 9 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  9. Physical Hardware Architecture &amp; Pinout (VSCU Onboard Unit)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Embedded schematic architecture based on ESP32-S3-WROOM-1, Quectel EC200U-EU Cat-1/GNSS, LSM6DS3 IMU, and 9V–36V power protection.
              </p>
            </div>
          </div>

          {/* Subsystems Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Power Tree &amp; Backup</span>
              </div>
              <p className="text-[11px] text-slate-600">
                • 9V–36V nominal input<br />
                • SMBJ36CA 60V TVS diode<br />
                • MP2451 Buck to 3.8V @ 2.5A<br />
                • ME6211 LDO to 3.3V<br />
                • 3.7V 1200mAh LiPo + TP4056
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>Cellular &amp; GNSS</span>
              </div>
              <p className="text-[11px] text-slate-600">
                • Quectel EC200U-EU Cat-1<br />
                • 10Mbps DL / 5Mbps UL<br />
                • GPS / GLONASS / Galileo<br />
                • &lt; 2.5m CEP accuracy<br />
                • Dual SMA RF connectors
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Sensors &amp; Inputs</span>
              </div>
              <p className="text-[11px] text-slate-600">
                • LSM6DS3TR-C 6-axis IMU<br />
                • 104Hz ODR &amp; ±16g range<br />
                • PC817 Optocoupled ACC<br />
                • Casing tamper microswitch<br />
                • Car battery ADC voltage divider
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Immobilizer &amp; Safety</span>
              </div>
              <p className="text-[11px] text-slate-600">
                • 12V 30A NC Automotive Relay<br />
                • AO3400 N-MOSFET driver<br />
                • 1N4007 flyback diode<br />
                • Fail-safe Normally Closed<br />
                • Speed gate: Locked if &gt; 5 km/h
              </p>
            </div>
          </div>

          {/* Full GPIO Mapping Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>ESP32-S3 Physical Pinout Interconnect Matrix</span>
              <span className="text-xs font-normal text-slate-500 font-mono">19 Pins Configured</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-2.5">GPIO Pin</th>
                    <th className="p-2.5">Signal</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Voltage</th>
                    <th className="p-2.5">Peripheral Connection &amp; Functional Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO1</td>
                    <td className="p-2.5 font-bold">VEH_BAT_ADC</td>
                    <td className="p-2.5">Analog In</td>
                    <td className="p-2.5">0-3.3V</td>
                    <td className="p-2.5 font-sans">Car battery voltage monitor (100kΩ/10kΩ divider). Senses 12V disconnect.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO2</td>
                    <td className="p-2.5 font-bold">LTE_RESET</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Quectel EC200U cellular modem hardware reset.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO3</td>
                    <td className="p-2.5 font-bold">IMU_INT1</td>
                    <td className="p-2.5">Interrupt In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">LSM6DS3 hardware motion interrupt. Detects &gt;3.5g crash &amp; vehicle rollover.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO4</td>
                    <td className="p-2.5 font-bold">LIPO_BAT_ADC</td>
                    <td className="p-2.5">Analog In</td>
                    <td className="p-2.5">0-3.3V</td>
                    <td className="p-2.5 font-sans">Internal 3.7V LiPo backup battery divider (reports backup runtime).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO5</td>
                    <td className="p-2.5 font-bold">ACC_SENSE</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">PC817 Optocoupler isolated 12V ACC line (HIGH = Ignition ON, LOW = Off).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO6</td>
                    <td className="p-2.5 font-bold">TAMPER_SW</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Physical casing microswitch (triggers immediate tamper incident if opened).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO7</td>
                    <td className="p-2.5 font-bold">RELAY_KILL</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">AO3400 N-MOSFET controlling 12V 30A fuel pump cutoff relay (Normally Closed).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO8</td>
                    <td className="p-2.5 font-bold">SOS_BUTTON</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Driver emergency SOS panic button (debounced hardware pull-up).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO12..14</td>
                    <td className="p-2.5 font-bold">LED_RGB</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Status LEDs: Red (Armed/Alarm), Green (LTE/MQTT Online), Blue (GNSS 3D Fix).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO15</td>
                    <td className="p-2.5 font-bold">BUZZER_PWM</td>
                    <td className="p-2.5">PWM Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Piezo acoustic siren / chirps for arming and tamper alarms.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO17..18</td>
                    <td className="p-2.5 font-bold">UART_LTE</td>
                    <td className="p-2.5">UART</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">High-speed serial to Quectel EC200U modem @ 115200 baud for AT and PPP.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO19..20</td>
                    <td className="p-2.5 font-bold">CAN_BUS</td>
                    <td className="p-2.5">CAN</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">SN65HVD230 transceiver reading vehicle OBD-II CAN bus (RPM, Speed, DTC).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO21..22</td>
                    <td className="p-2.5 font-bold">I2C_IMU</td>
                    <td className="p-2.5">I2C</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">I2C bus to LSM6DS3 6-axis accelerometer &amp; gyroscope @ 400kHz.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
