import React, { useState } from 'react';
import { Terminal, Code, Database, Key, Check, Copy, Play, Layers, ExternalLink } from 'lucide-react';
import { Vehicle, ESP32Device, SecurityEvent } from '../types/smrod';

interface BackendSpecViewProps {
  vehicles: Vehicle[];
  devices: ESP32Device[];
  events: SecurityEvent[];
}

export const BackendSpecView: React.FC<BackendSpecViewProps> = ({
  vehicles,
  devices,
  events
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/vehicles/');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number>(200);
  const [activeCodeTab, setActiveCodeTab] = useState<'auth' | 'models' | 'commands' | 'structure'>('auth');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestEndpoint = (endpoint: string) => {
    setSelectedEndpoint(endpoint);

    if (endpoint === 'GET /api/v1/vehicles/') {
      setResponseStatus(200);
      setApiResponse({
        count: vehicles.length,
        next: null,
        previous: null,
        results: vehicles.map((v) => ({
          id: v.id,
          plate_number: v.plateNumber,
          vin: v.vin,
          make: v.make,
          model: v.model,
          year: v.year,
          device_uid: v.deviceId,
          security_status: v.securityStatus,
          is_immobilized: v.isImmobilized,
          telemetry: {
            speed_kmh: v.currentSpeed,
            battery_voltage: v.batteryVoltage,
            latitude: v.latitude,
            longitude: v.longitude
          }
        }))
      });
    } else if (endpoint === 'GET /api/v1/devices/') {
      setResponseStatus(200);
      setApiResponse({
        count: devices.length,
        results: devices.map((d) => ({
          id: d.id,
          serial_number: d.serialNumber,
          imei: d.imei,
          hardware_uid: d.hardwareUid,
          mac_address: d.macAddress,
          vehicle_plate: d.vehiclePlate,
          connection_status: d.connectionStatus,
          firmware_version: d.firmwareVersion,
          battery_level_pct: d.batteryLevel,
          lte_rssi_dbm: d.lteSignalRssi,
          gnss_fix: d.gnssFix,
          gnss_satellites: d.gnssSatellites
        }))
      });
    } else if (endpoint === 'GET /api/v1/security-events/') {
      setResponseStatus(200);
      setApiResponse({
        count: events.length,
        results: events.map((e) => ({
          event_id: e.id,
          vehicle_plate: e.vehiclePlate,
          event_type: e.eventType,
          severity: e.severity,
          risk_score: e.riskScore,
          status: e.status,
          coordinates: [e.latitude, e.longitude],
          telemetry_snapshot: e.telemetrySnapshot
        }))
      });
    } else if (endpoint === 'POST /api/v1/commands/immobilize/') {
      setResponseStatus(201);
      setApiResponse({
        command_id: 'cmd_' + Date.now(),
        idempotency_key: 'idemp_immob_' + Math.random().toString(36).substring(7),
        status: 'dispatched_mqtt',
        target_device: 'ESP32S3-7CDF-A182-01',
        directive: 'IMMOBILIZE_FUEL_RELAY',
        safety_checks: {
          speed_under_5kmh: true,
          authorized_operator: true,
          timestamp: new Date().toISOString()
        },
        broker_topic: 'smrod/v1/devices/ESP32S3-7CDF-A182-01/cmd'
      });
    } else {
      setResponseStatus(200);
      setApiResponse({
        total_registered_vehicles: vehicles.length,
        online_devices: devices.filter(d => d.connectionStatus === 'online').length,
        active_security_incidents: events.filter(e => e.status !== 'resolved').length,
        system_health: 'NORMAL'
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const DJANGO_AUTH_CODE = `"""
apps/accounts/authentication.py
Supabase JWT Authentication for Django REST Framework
Validates Supabase-issued JWT access tokens and links to Django UserProfile.
"""

import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import UserProfile

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    Verifies Supabase Auth JWT token from Authorization header.
    Validates signature using SUPABASE_JWT_SECRET and audience 'authenticated'.
    """
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
                audience='authenticated',
                options={"verify_exp": True}
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Supabase token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid Supabase token: {str(e)}')

        supabase_uid = payload.get('sub')
        email = payload.get('email')

        # Retrieve or hydrate local Django UserProfile linked to Supabase UID
        user_profile, _ = UserProfile.objects.get_or_create(
            supabase_uid=supabase_uid,
            defaults={'email': email, 'role': 'viewer'}
        )

        if not user_profile.is_active:
            raise exceptions.PermissionDenied('User account is suspended')

        return (user_profile, token)`;

  const DJANGO_MODELS_CODE = `"""
apps/vehicles/models.py & apps/devices/models.py
Relational PostgreSQL models for Vehicles and ESP32-S3 IoT units.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Vehicle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plate_number = models.CharField(max_length=20, unique=True, db_index=True)
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    owner_name = models.CharField(max_length=120)
    is_immobilized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ESP32Device(models.Model):
    CONNECTION_CHOICES = [('online', 'Online'), ('offline', 'Offline'), ('degraded', 'Degraded')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hardware_uid = models.CharField(max_length=64, unique=True, db_index=True)
    mac_address = models.CharField(max_length=17, unique=True)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='esp_device')
    connection_status = models.CharField(max_length=16, choices=CONNECTION_CHOICES, default='offline')
    firmware_version = models.CharField(max_length=32, default='v2.4.1-smrod-prod')
    battery_level = models.PositiveSmallIntegerField(default=100)
    lte_signal_rssi = models.SmallIntegerField(default=-70)
    last_ping_time = models.DateTimeField(null=True, blank=True)
    client_cert_serial = models.CharField(max_length=128, help_text="mTLS X.509 device identity")`;

  const DJANGO_STRUCTURE_CODE = `smrod-backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── local.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py           # Channels WebSockets for live map & telemetry
│   └── wsgi.py
├── apps/
│   ├── accounts/         # Supabase Auth JWT verification & user profiles
│   ├── roles/            # Django RBAC permissions & object access
│   ├── vehicles/         # Vehicle registry, plates, immobilize latch
│   ├── devices/          # ESP32-S3 hardware units, mTLS certs, firmware
│   ├── telemetry/        # Time-series GNSS, IMU g-forces, battery line
│   ├── locations/        # GPS coordinates & breadcrumb history
│   ├── security_events/  # Crash alerts, unauthorized movement, geofence exit
│   ├── commands/         # Signed MQTT vehicle directives & idempotency keys
│   ├── geofences/        # Spatial polygons, circular radius, speed limits
│   ├── emergencies/      # SOS dispatcher & critical incident escalation
│   ├── notifications/    # Push notifications (FCM / SMS)
│   ├── risk_scoring/     # Multi-sensor security risk assessment algorithm
│   ├── audit_logs/       # Immutable cryptographic audit trail
│   └── dashboard/        # Operational KPI metrics & real-time feed
├── integrations/
│   ├── supabase/         # Supabase SDK client & webhook listeners
│   ├── mqtt/             # Paho MQTT TLS 1.3 edge broker client
│   └── maps/             # Reverse geocoding & spatial calculations
├── common/
│   ├── permissions/      # HasRolePermission, IsSuperAdmin, CanExecuteCommands
│   ├── exceptions/       # Custom DRF exception handler
│   └── pagination/       # StandardCursorPagination & LimitOffsetPagination
├── requirements/
│   ├── base.txt          # django, djangorestframework, pyjwt, psycopg, channels, celery
│   └── prod.txt
├── manage.py
└── Dockerfile`;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Django Modular Monolith &amp; Supabase Auth System
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Django Backend Architecture &amp; REST API Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full architectural specification replacing the original NestJS backend with Django REST Framework, PostgreSQL, and Supabase Auth.
        </p>
      </div>

      {/* Code and Blueprint Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('auth')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeCodeTab === 'auth' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supabase Auth Middleware
            </button>
            <button
              onClick={() => setActiveCodeTab('models')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeCodeTab === 'models' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PostgreSQL Relational Models
            </button>
            <button
              onClick={() => setActiveCodeTab('structure')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeCodeTab === 'structure' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Backend Project Structure
            </button>
          </div>

          <button
            onClick={() => handleCopyCode(
              activeCodeTab === 'auth' ? DJANGO_AUTH_CODE : activeCodeTab === 'models' ? DJANGO_MODELS_CODE : DJANGO_STRUCTURE_CODE
            )}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-100 overflow-x-auto text-xs font-mono leading-relaxed">
          <pre>
            {activeCodeTab === 'auth' && DJANGO_AUTH_CODE}
            {activeCodeTab === 'models' && DJANGO_MODELS_CODE}
            {activeCodeTab === 'structure' && DJANGO_STRUCTURE_CODE}
          </pre>
        </div>
      </div>

      {/* Interactive REST API Explorer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Interactive REST API Sandbox (/api/v1/)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select an endpoint to execute a simulated authenticated request and inspect the response payload.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Authorization: Bearer SUPABASE_JWT_TOKEN
          </span>
        </div>

        {/* Endpoint Selector Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'GET /api/v1/vehicles/',
            'GET /api/v1/devices/',
            'GET /api/v1/security-events/',
            'POST /api/v1/commands/immobilize/',
            'GET /api/v1/dashboard/metrics/'
          ].map((ep) => (
            <button
              key={ep}
              onClick={() => handleTestEndpoint(ep)}
              className={`px-3 py-1.5 rounded-lg border font-mono transition-colors flex items-center gap-1.5 ${
                selectedEndpoint === ep
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>{ep}</span>
            </button>
          ))}
        </div>

        {/* Response JSON Inspector */}
        <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold">{selectedEndpoint}</span>
              <span className={`px-2 py-0.2 rounded font-bold ${
                responseStatus >= 200 && responseStatus < 300 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
              }`}>
                HTTP {responseStatus} OK
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Latency: 42ms · Content-Type: application/json</span>
          </div>

          <pre className="text-emerald-400 max-h-80 overflow-y-auto leading-relaxed pt-1">
            {JSON.stringify(
              apiResponse || {
                count: vehicles.length,
                results: vehicles.slice(0, 2)
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};
