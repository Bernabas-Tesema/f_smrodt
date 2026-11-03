import { createClient } from '@supabase/supabase-js';
import {
  Vehicle,
  VSCUDevice,
  SecurityEvent,
  RemoteCommand,
  Geofence,
  AuditLog,
  UserAccount
} from '../types/smrod';
import {
  INITIAL_VEHICLES,
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  INITIAL_COMMANDS,
  INITIAL_GEOFENCES,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS
} from '../data/mockData';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://tobexeirhbjehfwrojty.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmV4ZWlyaGJqZWhmd3JvanR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2OTU2ODcsImV4cCI6MjEwOTI3MTY4N30.SFB7tCCWl8U5NKrJT72cYtCEcSr2usg-QppQ1SMWmQU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ==========================================
// DB <-> Frontend Data Mappers
// ==========================================

export function mapVehicleFromDb(row: any): Vehicle {
  return {
    id: row.id,
    plateNumber: row.plate_number || row.plateNumber || 'Unknown',
    vin: row.vin || '',
    make: row.make || 'Toyota',
    model: row.model || 'Land Cruiser',
    year: Number(row.year) || 2023,
    color: row.color || 'White',
    ownerName: row.owner_name || row.ownerName || 'Fleet Admin',
    ownerEmail: row.owner_email || row.ownerEmail || 'admin@smrod.ai',
    ownerPhone: row.owner_phone || row.ownerPhone || '+251 911 000 112',
    deviceId: row.device_id || row.deviceId || 'VSCU-S3-001092',
    status: row.status || 'active',
    securityStatus: row.security_status || row.securityStatus || 'normal',
    isImmobilized: Boolean(row.is_immobilized ?? row.isImmobilized),
    currentSpeed: Number(row.current_speed ?? row.currentSpeed ?? 0),
    isMoving: Boolean(row.is_moving ?? row.isMoving),
    hasIncident: Boolean(row.has_incident ?? row.hasIncident),
    heading: Number(row.heading ?? 0),
    latitude: Number(row.latitude ?? 9.03),
    longitude: Number(row.longitude ?? 38.74),
    lastLocationTime: row.last_location_time || row.lastLocationTime || 'Just now',
    batteryVoltage: Number(row.battery_voltage ?? row.batteryVoltage ?? 12.6),
    fuelLevel: row.fuel_level !== undefined ? Number(row.fuel_level) : row.fuelLevel ?? 80,
    odometerKm: Number(row.odometer_km ?? row.odometerKm ?? 24500)
  };
}

export function mapVehicleToDb(v: Partial<Vehicle>): any {
  const db: any = {};
  if (v.id !== undefined) db.id = v.id;
  if (v.plateNumber !== undefined) db.plate_number = v.plateNumber;
  if (v.vin !== undefined) db.vin = v.vin;
  if (v.make !== undefined) db.make = v.make;
  if (v.model !== undefined) db.model = v.model;
  if (v.year !== undefined) db.year = v.year;
  if (v.color !== undefined) db.color = v.color;
  if (v.ownerName !== undefined) db.owner_name = v.ownerName;
  if (v.ownerEmail !== undefined) db.owner_email = v.ownerEmail;
  if (v.ownerPhone !== undefined) db.owner_phone = v.ownerPhone;
  if (v.deviceId !== undefined) db.device_id = v.deviceId;
  if (v.status !== undefined) db.status = v.status;
  if (v.securityStatus !== undefined) db.security_status = v.securityStatus;
  if (v.isImmobilized !== undefined) db.is_immobilized = v.isImmobilized;
  if (v.currentSpeed !== undefined) db.current_speed = v.currentSpeed;
  if (v.isMoving !== undefined) db.is_moving = v.isMoving;
  if (v.hasIncident !== undefined) db.has_incident = v.hasIncident;
  if (v.heading !== undefined) db.heading = v.heading;
  if (v.latitude !== undefined) db.latitude = v.latitude;
  if (v.longitude !== undefined) db.longitude = v.longitude;
  if (v.lastLocationTime !== undefined) db.last_location_time = v.lastLocationTime;
  if (v.batteryVoltage !== undefined) db.battery_voltage = v.batteryVoltage;
  if (v.fuelLevel !== undefined) db.fuel_level = v.fuelLevel;
  if (v.odometerKm !== undefined) db.odometer_km = v.odometerKm;
  return db;
}

export function mapSecurityEventFromDb(row: any): SecurityEvent {
  return {
    id: row.id,
    timestamp: row.timestamp || 'Just now',
    vehicleId: row.vehicle_id || row.vehicleId || '',
    vehiclePlate: row.vehicle_plate || row.vehiclePlate || 'Unknown',
    deviceId: row.device_id || row.deviceId || '',
    eventType: row.event_type || row.eventType || 'unauthorized_movement',
    severity: row.severity || 'moderate',
    riskScore: Number(row.risk_score ?? row.riskScore ?? 50),
    status: row.status || 'new',
    latitude: Number(row.latitude ?? 9.03),
    longitude: Number(row.longitude ?? 38.74),
    locationName: row.location_name || row.locationName || 'Bole Sub-City, Addis Ababa',
    description: row.description || '',
    assignedOperator: row.assigned_operator || row.assignedOperator,
    resolutionNotes: row.resolution_notes || row.resolutionNotes,
    telemetrySnapshot: row.telemetry_snapshot || row.telemetrySnapshot
  };
}

export function mapSecurityEventToDb(e: Partial<SecurityEvent>): any {
  const db: any = {};
  if (e.id !== undefined) db.id = e.id;
  if (e.timestamp !== undefined) db.timestamp = e.timestamp;
  if (e.vehicleId !== undefined) db.vehicle_id = e.vehicleId;
  if (e.vehiclePlate !== undefined) db.vehicle_plate = e.vehiclePlate;
  if (e.deviceId !== undefined) db.device_id = e.deviceId;
  if (e.eventType !== undefined) db.event_type = e.eventType;
  if (e.severity !== undefined) db.severity = e.severity;
  if (e.riskScore !== undefined) db.risk_score = e.riskScore;
  if (e.status !== undefined) db.status = e.status;
  if (e.latitude !== undefined) db.latitude = e.latitude;
  if (e.longitude !== undefined) db.longitude = e.longitude;
  if (e.locationName !== undefined) db.location_name = e.locationName;
  if (e.description !== undefined) db.description = e.description;
  if (e.assignedOperator !== undefined) db.assigned_operator = e.assignedOperator;
  if (e.resolutionNotes !== undefined) db.resolution_notes = e.resolutionNotes;
  if (e.telemetrySnapshot !== undefined) db.telemetry_snapshot = e.telemetrySnapshot;
  return db;
}

export function mapRemoteCommandFromDb(row: any): RemoteCommand {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key || row.idempotencyKey || `idemp_${Date.now()}`,
    timestamp: row.timestamp || 'Just now',
    vehicleId: row.vehicle_id || row.vehicleId || '',
    vehiclePlate: row.vehicle_plate || row.vehiclePlate || 'Unknown',
    deviceId: row.device_id || row.deviceId || '',
    commandType: row.command_type || row.commandType || 'diagnostics_ping',
    issuedBy: row.issued_by || row.issuedBy || 'Operator',
    operatorRole: row.operator_role || row.operatorRole || 'super_admin',
    status: row.status || 'executed',
    safetyCheckPassed: Boolean(row.safety_check_passed ?? row.safetyCheckPassed ?? true),
    deliveryLatencyMs: row.delivery_latency_ms || row.deliveryLatencyMs,
    executionResult: row.execution_result || row.executionResult
  };
}

export function mapRemoteCommandToDb(c: Partial<RemoteCommand>): any {
  const db: any = {};
  if (c.id !== undefined) db.id = c.id;
  if (c.idempotencyKey !== undefined) db.idempotency_key = c.idempotencyKey;
  if (c.timestamp !== undefined) db.timestamp = c.timestamp;
  if (c.vehicleId !== undefined) db.vehicle_id = c.vehicleId;
  if (c.vehiclePlate !== undefined) db.vehicle_plate = c.vehiclePlate;
  if (c.deviceId !== undefined) db.device_id = c.deviceId;
  if (c.commandType !== undefined) db.command_type = c.commandType;
  if (c.issuedBy !== undefined) db.issued_by = c.issuedBy;
  if (c.operatorRole !== undefined) db.operator_role = c.operatorRole;
  if (c.status !== undefined) db.status = c.status;
  if (c.safetyCheckPassed !== undefined) db.safety_check_passed = c.safetyCheckPassed;
  if (c.deliveryLatencyMs !== undefined) db.delivery_latency_ms = c.deliveryLatencyMs;
  if (c.executionResult !== undefined) db.execution_result = c.executionResult;
  return db;
}

export function mapGeofenceFromDb(row: any): Geofence {
  return {
    id: row.id,
    name: row.name || 'Geofence',
    type: row.type || 'circle',
    radiusMeters: Number(row.radius_meters ?? row.radiusMeters ?? 1500),
    centerLat: Number(row.center_lat ?? row.centerLat ?? 9.03),
    centerLng: Number(row.center_lng ?? row.centerLng ?? 38.74),
    status: row.status || 'active',
    speedLimitKmH: row.speed_limit_kmh !== undefined ? Number(row.speed_limit_kmh) : row.speedLimitKmH,
    assignedVehiclesCount: Number(row.assigned_vehicles_count ?? row.assignedVehiclesCount ?? 0),
    breachCount24h: Number(row.breach_count_24h ?? row.breachCount24h ?? 0),
    createdAt: row.created_at || row.createdAt || '2025-01-15'
  };
}

export function mapGeofenceToDb(g: Partial<Geofence>): any {
  const db: any = {};
  if (g.id !== undefined) db.id = g.id;
  if (g.name !== undefined) db.name = g.name;
  if (g.type !== undefined) db.type = g.type;
  if (g.radiusMeters !== undefined) db.radius_meters = g.radiusMeters;
  if (g.centerLat !== undefined) db.center_lat = g.centerLat;
  if (g.centerLng !== undefined) db.center_lng = g.centerLng;
  if (g.status !== undefined) db.status = g.status;
  if (g.speedLimitKmH !== undefined) db.speed_limit_kmh = g.speedLimitKmH;
  if (g.assignedVehiclesCount !== undefined) db.assigned_vehicles_count = g.assignedVehiclesCount;
  if (g.breachCount24h !== undefined) db.breach_count_24h = g.breachCount24h;
  return db;
}

export function mapAuditLogFromDb(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp || 'Just now',
    actorEmail: row.actor_email || row.actorEmail || 'system@smrod.ai',
    actorRole: row.actor_role || row.actorRole || 'super_admin',
    action: row.action || 'OPERATION',
    targetResource: row.target_resource || row.targetResource || 'System',
    ipAddress: row.ip_address || row.ipAddress || '197.232.88.14',
    status: row.status || 'success',
    details: row.details || ''
  };
}

export function mapAuditLogToDb(log: Partial<AuditLog>): any {
  const db: any = {};
  if (log.id !== undefined) db.id = log.id;
  if (log.timestamp !== undefined) db.timestamp = log.timestamp;
  if (log.actorEmail !== undefined) db.actor_email = log.actorEmail;
  if (log.actorRole !== undefined) db.actor_role = log.actorRole;
  if (log.action !== undefined) db.action = log.action;
  if (log.targetResource !== undefined) db.target_resource = log.targetResource;
  if (log.ipAddress !== undefined) db.ip_address = log.ipAddress;
  if (log.status !== undefined) db.status = log.status;
  if (log.details !== undefined) db.details = log.details;
  return db;
}

// ==========================================
// Real-Time Supabase Service & CRUD API
// ==========================================

export class SupabaseService {
  /**
   * Fetch all vehicles with automatic seed fallback
   */
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] vehicles fetch failed, using fallback:', error.message);
        return INITIAL_VEHICLES;
      }
      if (!data || data.length === 0) {
        // Attempt to auto-seed initial vehicles if table is empty
        this.seedInitialVehicles().catch(console.error);
        return INITIAL_VEHICLES;
      }
      return data.map(mapVehicleFromDb);
    } catch (err) {
      console.warn('[Supabase] Exception querying vehicles:', err);
      return INITIAL_VEHICLES;
    }
  }

  /**
   * Seed vehicles into Supabase table
   */
  static async seedInitialVehicles(): Promise<void> {
    try {
      const rows = INITIAL_VEHICLES.map(mapVehicleToDb);
      await supabase.from('vehicles').upsert(rows, { onConflict: 'id' });
    } catch (e) {
      // Ignore if table not yet migrated
    }
  }

  /**
   * Insert new vehicle
   */
  static async createVehicle(veh: Vehicle): Promise<boolean> {
    try {
      const row = mapVehicleToDb(veh);
      const { error } = await supabase.from('vehicles').insert([row]);
      if (error) {
        console.error('[Supabase] Error creating vehicle:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('[Supabase] Create vehicle exception:', e);
      return false;
    }
  }

  /**
   * Update existing vehicle
   */
  static async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<boolean> {
    try {
      const row = mapVehicleToDb(updates);
      const { error } = await supabase.from('vehicles').update(row).eq('id', id);
      if (error) {
        console.warn('[Supabase] Error updating vehicle:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase] Update vehicle exception:', e);
      return false;
    }
  }

  /**
   * Trigger Remote Fuel Cutoff / Immobilization
   */
  static async setVehicleImmobilized(id: string, isImmobilized: boolean, speed = 0): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          is_immobilized: isImmobilized,
          current_speed: isImmobilized ? 0 : speed
        })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch Security Events
   */
  static async getSecurityEvents(): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_EVENTS;
      }
      return data.map(mapSecurityEventFromDb);
    } catch {
      return INITIAL_EVENTS;
    }
  }

  /**
   * Update Incident Status & Resolution
   */
  static async updateSecurityEvent(
    id: string,
    status: SecurityEvent['status'],
    notes?: string,
    operator?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          status,
          resolution_notes: notes,
          assigned_operator: operator
        })
        .eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch Remote Commands
   */
  static async getRemoteCommands(): Promise<RemoteCommand[]> {
    try {
      const { data, error } = await supabase
        .from('remote_commands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_COMMANDS;
      }
      return data.map(mapRemoteCommandFromDb);
    } catch {
      return INITIAL_COMMANDS;
    }
  }

  /**
   * Dispatch and record Remote Command
   */
  static async dispatchCommand(cmd: RemoteCommand): Promise<boolean> {
    try {
      const row = mapRemoteCommandToDb(cmd);
      const { error } = await supabase.from('remote_commands').insert([row]);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch Geofences
   */
  static async getGeofences(): Promise<Geofence[]> {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_GEOFENCES;
      }
      return data.map(mapGeofenceFromDb);
    } catch {
      return INITIAL_GEOFENCES;
    }
  }

  /**
   * Create Geofence
   */
  static async createGeofence(geo: Geofence): Promise<boolean> {
    try {
      const row = mapGeofenceToDb(geo);
      const { error } = await supabase.from('geofences').insert([row]);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Toggle Geofence Active Status
   */
  static async toggleGeofence(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    try {
      const { error } = await supabase.from('geofences').update({ status }).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch Audit Logs
   */
  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return INITIAL_AUDIT_LOGS;
      }
      return data.map(mapAuditLogFromDb);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  /**
   * Record Audit Log
   */
  static async recordAuditLog(log: AuditLog): Promise<boolean> {
    try {
      const row = mapAuditLogToDb(log);
      const { error } = await supabase.from('audit_logs').insert([row]);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Real-time Subscription to Vehicle Changes (GPS, Speed, Immobilization)
   */
  static subscribeVehicles(
    onUpsert: (veh: Vehicle) => void,
    onDelete?: (id: string) => void
  ) {
    const channel = supabase
      .channel('realtime:vehicles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            if (onDelete && payload.old?.id) onDelete(payload.old.id);
          } else if (payload.new) {
            onUpsert(mapVehicleFromDb(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Real-time Subscription to Security Incidents & Alerts
   */
  static subscribeSecurityEvents(onNewEvent: (event: SecurityEvent) => void) {
    const channel = supabase
      .channel('realtime:security_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_events' },
        (payload) => {
          if (payload.new) {
            onNewEvent(mapSecurityEventFromDb(payload.new));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'security_events' },
        (payload) => {
          if (payload.new) {
            onNewEvent(mapSecurityEventFromDb(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Real-time Subscription to Remote Commands
   */
  static subscribeRemoteCommands(onCommand: (cmd: RemoteCommand) => void) {
    const channel = supabase
      .channel('realtime:remote_commands')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'remote_commands' },
        (payload) => {
          if (payload.new) {
            onCommand(mapRemoteCommandFromDb(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
