export type SecurityStatus = 'normal' | 'warning' | 'critical';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance';
export type DeviceConnectionStatus = 'online' | 'offline' | 'degraded';
export type EventSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type EventStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved';
export type CommandType = 'immobilize' | 'mobilize' | 'trigger_alarm' | 'lock_doors' | 'unlock_doors' | 'diagnostics_ping' | 'reboot_device';
export type CommandStatus = 'queued' | 'dispatched' | 'acknowledged' | 'executed' | 'failed';
export type UserRole = 'super_admin' | 'admin' | 'operations' | 'support' | 'viewer';

export interface Vehicle {
  id: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  deviceId: string; // VSCU Device ID
  status: VehicleStatus;
  securityStatus: SecurityStatus;
  isImmobilized: boolean;
  currentSpeed: number; // km/h
  isMoving: boolean;
  hasIncident: boolean;
  heading: number; // degrees
  latitude: number;
  longitude: number;
  lastLocationTime: string;
  batteryVoltage: number; // Volts
  fuelLevel?: number; // %
  odometerKm: number;
}

export interface VSCUDevice {
  id: string;
  serialNumber: string; // VSCU-S3-XXXXXX
  imei: string; // 15-digit Quectel LTE Cat-1 IMEI
  hardwareUid: string;
  macAddress: string;
  vehicleId: string;
  vehiclePlate: string;
  connectionStatus: DeviceConnectionStatus;
  firmwareVersion: string;
  batteryLevel: number; // %
  batteryVoltage: number; // V
  lteSignalRssi: number; // dBm (-110 to -50)
  lteNetworkOperator: string;
  gnssFix: '3D_FIX' | '2D_FIX' | 'NO_FIX';
  gnssSatellites: number;
  imuStatus: 'normal' | 'impact_detected' | 'tilt_detected';
  lastPingTime: string;
  mcuTemperature: number; // Celsius
  uptimeHours: number;
}

// Alias for backwards compatibility
export type ESP32Device = VSCUDevice;

export interface SecurityEvent {
  id: string;
  timestamp: string;
  vehicleId: string;
  vehiclePlate: string;
  deviceId: string; // VSCU ID
  eventType: 'unauthorized_movement' | 'tampering' | 'power_loss' | 'crash_detected' | 'geofence_breach' | 'device_offline' | 'sos_emergency';
  severity: EventSeverity;
  riskScore: number; // 0 - 100
  status: EventStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  description: string;
  assignedOperator?: string;
  resolutionNotes?: string;
  telemetrySnapshot?: {
    speed: number;
    gForce?: number;
    batteryVoltage: number;
  };
}

export interface RemoteCommand {
  id: string;
  idempotencyKey: string;
  timestamp: string;
  vehicleId: string;
  vehiclePlate: string;
  deviceId: string;
  commandType: CommandType;
  issuedBy: string;
  operatorRole: UserRole;
  status: CommandStatus;
  safetyCheckPassed: boolean;
  deliveryLatencyMs?: number;
  executionResult?: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  radiusMeters?: number;
  centerLat: number;
  centerLng: number;
  status: 'active' | 'inactive';
  speedLimitKmH?: number;
  assignedVehiclesCount: number;
  breachCount24h: number;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  supabaseUid: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  assignedVehiclesCount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: 'success' | 'failure';
  details: string;
}
