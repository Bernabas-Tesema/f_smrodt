import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/authentication/domain/entities/user.dart';
import '../../features/emergency/data/models/emergency_event_model.dart';
import '../../features/emergency/domain/entities/emergency_event.dart';
import '../../features/geofence/data/models/geofence_model.dart';
import '../../features/geofence/domain/entities/geofence.dart';
import '../../features/notifications/data/datasources/notification_datasource.dart';
import '../../features/security/data/models/security_event_model.dart';
import '../../features/security/domain/entities/security_event.dart';
import '../../features/tracking/data/models/location_model.dart';
import '../../features/tracking/domain/entities/vehicle_location.dart';
import '../../features/vehicle/data/models/vehicle_model.dart';
import '../../features/vehicle/domain/entities/vehicle.dart';
import '../constants/app_constants.dart';
import '../errors/app_exception.dart';
import 'local_storage_service.dart';

class AccountRecord {
  const AccountRecord({
    required this.id,
    required this.email,
    required this.displayName,
    required this.password,
    required this.role,
    required this.mfaEnabled,
  });

  final String id;
  final String email;
  final String displayName;
  final String password;
  final String role;
  final bool mfaEnabled;

  User toUser() {
    return User(
      id: id,
      email: email,
      displayName: displayName,
      role: role,
      mfaEnabled: mfaEnabled,
    );
  }

  factory AccountRecord.fromJson(Map<String, dynamic> json) {
    return AccountRecord(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String,
      password: json['password'] as String,
      role: json['role'] as String? ?? 'owner',
      mfaEnabled: json['mfaEnabled'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'displayName': displayName,
    'password': password,
    'role': role,
    'mfaEnabled': mfaEnabled,
  };
}

class PilotData {
  const PilotData({
    required this.accounts,
    required this.vehicle,
    required this.history,
    required this.securityEvents,
    required this.commands,
    required this.emergencyEvents,
    required this.geofences,
    required this.notifications,
    required this.movementActive,
    required this.geofenceAlerted,
  });

  final List<AccountRecord> accounts;
  final Vehicle? vehicle;
  final List<VehicleLocation> history;
  final List<SecurityEvent> securityEvents;
  final List<VehicleCommand> commands;
  final List<EmergencyEvent> emergencyEvents;
  final List<Geofence> geofences;
  final List<AppNotification> notifications;
  final bool movementActive;
  final bool geofenceAlerted;

  int get unreadCount => notifications.where((item) => !item.read).length;

  VehicleLocation? get currentLocation {
    final current = vehicle;
    if (current == null) return null;
    return VehicleLocation(
      vehicleId: current.id,
      latitude: current.latitude,
      longitude: current.longitude,
      speedKph: current.speedKph,
      timestamp: current.updatedAt,
      address: current.address,
    );
  }

  factory PilotData.empty() {
    return PilotData(
      accounts: [
        AccountRecord(
          id: 'user-owner',
          email: AppConstants.demoEmail,
          displayName: 'Pilot Owner',
          password: AppConstants.demoPassword,
          role: 'owner',
          mfaEnabled: false,
        ),
      ],
      vehicle: null,
      history: const [],
      securityEvents: const [],
      commands: const [],
      emergencyEvents: const [],
      geofences: const [],
      notifications: const [],
      movementActive: false,
      geofenceAlerted: false,
    );
  }

  PilotData copyWith({
    List<AccountRecord>? accounts,
    Object? vehicle = _keep,
    List<VehicleLocation>? history,
    List<SecurityEvent>? securityEvents,
    List<VehicleCommand>? commands,
    List<EmergencyEvent>? emergencyEvents,
    List<Geofence>? geofences,
    List<AppNotification>? notifications,
    bool? movementActive,
    bool? geofenceAlerted,
  }) {
    return PilotData(
      accounts: accounts ?? this.accounts,
      vehicle: identical(vehicle, _keep) ? this.vehicle : vehicle as Vehicle?,
      history: history ?? this.history,
      securityEvents: securityEvents ?? this.securityEvents,
      commands: commands ?? this.commands,
      emergencyEvents: emergencyEvents ?? this.emergencyEvents,
      geofences: geofences ?? this.geofences,
      notifications: notifications ?? this.notifications,
      movementActive: movementActive ?? this.movementActive,
      geofenceAlerted: geofenceAlerted ?? this.geofenceAlerted,
    );
  }

  Map<String, dynamic> toJson() => {
    'accounts': accounts.map((item) => item.toJson()).toList(),
    'vehicle': vehicle == null ? null : VehicleModel.fromEntity(vehicle!).toJson(),
    'history': history.map((item) => LocationModel.fromEntity(item).toJson()).toList(),
    'securityEvents': securityEvents
        .map((item) => SecurityEventModel.fromEntity(item).toJson())
        .toList(),
    'commands': commands.map((item) => VehicleCommandModel.fromEntity(item).toJson()).toList(),
    'emergencyEvents': emergencyEvents
        .map((item) => EmergencyEventModel.fromEntity(item).toJson())
        .toList(),
    'geofences': geofences.map((item) => GeofenceModel.fromEntity(item).toJson()).toList(),
    'notifications': notifications.map((item) => item.toJson()).toList(),
    'movementActive': movementActive,
    'geofenceAlerted': geofenceAlerted,
  };

  factory PilotData.fromJson(Map<String, dynamic> json) {
    final accounts = (json['accounts'] as List<dynamic>? ?? const [])
        .map((item) => AccountRecord.fromJson(item as Map<String, dynamic>))
        .toList();
    final vehicleJson = json['vehicle'];
    return PilotData(
      accounts: accounts.isEmpty ? PilotData.empty().accounts : accounts,
      vehicle: vehicleJson is Map<String, dynamic>
          ? VehicleModel.fromJson(vehicleJson).toEntity()
          : null,
      history: (json['history'] as List<dynamic>? ?? const [])
          .map((item) => LocationModel.fromJson(item as Map<String, dynamic>).toEntity())
          .toList(),
      securityEvents: (json['securityEvents'] as List<dynamic>? ?? const [])
          .map((item) => SecurityEventModel.fromJson(item as Map<String, dynamic>).toEntity())
          .toList(),
      commands: (json['commands'] as List<dynamic>? ?? const [])
          .map((item) => VehicleCommandModel.fromJson(item as Map<String, dynamic>).toEntity())
          .toList(),
      emergencyEvents: (json['emergencyEvents'] as List<dynamic>? ?? const [])
          .map((item) => EmergencyEventModel.fromJson(item as Map<String, dynamic>).toEntity())
          .toList(),
      geofences: (json['geofences'] as List<dynamic>? ?? const [])
          .map((item) => GeofenceModel.fromJson(item as Map<String, dynamic>).toEntity())
          .toList(),
      notifications: (json['notifications'] as List<dynamic>? ?? const [])
          .map((item) => AppNotification.fromJson(item as Map<String, dynamic>))
          .toList(),
      movementActive: json['movementActive'] as bool? ?? false,
      geofenceAlerted: json['geofenceAlerted'] as bool? ?? false,
    );
  }
}

const _keep = Object();

/// Shared pilot store for the V1 owner app. It is the offline cache and the
/// stand-in for the cloud modules until the API is connected.
class PilotStore extends Notifier<PilotData> {
  Timer? _moveTimer;

  PilotData get snapshot => state;

  @override
  PilotData build() {
    ref.onDispose(() => _moveTimer?.cancel());
    final raw = LocalStorageService.instance.getString(AppConstants.pilotSnapshotKey);
    if (raw == null || raw.isEmpty) return PilotData.empty();
    try {
      final data = PilotData.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      if (data.movementActive) {
        Future.microtask(_ensureTimer);
      }
      return _withCategoryAlerts(data);
    } catch (_) {
      return PilotData.empty();
    }
  }

  PilotData _withCategoryAlerts(PilotData data) {
    if (data.vehicle == null) return data;
    final present = data.notifications.map((item) => item.severity).toSet();
    final now = DateTime.now();
    final added = <AppNotification>[
      if (!present.contains(AlertSeverity.critical))
        AppNotification(
          id: 'ntf-critical',
          title: 'Possible theft',
          body: 'The armed vehicle is moving outside the home zone.',
          severity: AlertSeverity.critical,
          createdAt: now.subtract(const Duration(minutes: 4)),
          read: false,
        ),
      if (!present.contains(AlertSeverity.warning))
        AppNotification(
          id: 'ntf-warning',
          title: 'Left home zone',
          body: 'The vehicle crossed the home geofence.',
          severity: AlertSeverity.warning,
          createdAt: now.subtract(const Duration(minutes: 18)),
          read: false,
        ),
      if (!present.contains(AlertSeverity.info))
        AppNotification(
          id: 'ntf-online',
          title: 'Device online',
          body: 'The control unit checked in. Battery 86%.',
          severity: AlertSeverity.info,
          createdAt: now.subtract(const Duration(minutes: 40)),
          read: false,
        ),
    ];
    if (added.isEmpty) return data;
    final merged = [...added, ...data.notifications]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return data.copyWith(notifications: merged);
  }

  User? authenticate(String email, String password) {
    final normalized = email.trim().toLowerCase();
    for (final account in state.accounts) {
      if (account.email.toLowerCase() == normalized && account.password == password) {
        return account.toUser();
      }
    }
    return null;
  }

  User? findByEmail(String email) {
    final normalized = email.trim().toLowerCase();
    for (final account in state.accounts) {
      if (account.email.toLowerCase() == normalized) return account.toUser();
    }
    return null;
  }

  User register({
    required String displayName,
    required String email,
    required String password,
  }) {
    final normalized = email.trim().toLowerCase();
    if (findByEmail(normalized) != null) {
      throw const AppException('An account with that email already exists.');
    }
    final account = AccountRecord(
      id: _id('user'),
      email: normalized,
      displayName: displayName.trim(),
      password: password,
      role: 'owner',
      mfaEnabled: false,
    );
    _set(state.copyWith(accounts: [...state.accounts, account]));
    return account.toUser();
  }

  void prepareSession(User user, {bool seedIfEmpty = false}) {
    final demo = user.email == AppConstants.demoEmail;
    if (state.vehicle == null && (demo || seedIfEmpty)) {
      _set(_demoSnapshot(user));
    }
  }

  Vehicle? vehicleFor(String ownerId) {
    final vehicle = state.vehicle;
    if (vehicle == null || vehicle.ownerId != ownerId) return null;
    return vehicle;
  }

  Vehicle pair({
    required User owner,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) {
    final now = DateTime.now();
    final assessment = RiskModel.assess(
      movingWhileArmed: false,
      ownerSessionActive: true,
      outsideGeofence: false,
      at: now,
    );
    final vehicle = Vehicle(
      id: _id('veh'),
      ownerId: owner.id,
      deviceId: _id('dev'),
      serialNo: serialNo.trim(),
      make: make.trim(),
      model: model.trim(),
      plateNo: plateNo.trim().toUpperCase(),
      armed: true,
      immobilized: false,
      online: true,
      powerCut: false,
      doorOpen: false,
      batteryPercent: 92,
      backupBatteryPercent: 100,
      firmwareVersion: '1.0.0',
      latitude: AppConstants.homeLatitude,
      longitude: AppConstants.homeLongitude,
      speedKph: 0,
      address: 'Bole, Addis Ababa',
      riskScore: assessment.score,
      riskLevel: assessment.level,
      riskFactors: assessment.factors,
      updatedAt: now,
    );
    final zone = _homeZone(vehicle);
    final notice = AppNotification(
      id: _id('ntf'),
      title: 'Vehicle paired',
      body: '${vehicle.title} is online and armed.',
      severity: AlertSeverity.info,
      createdAt: now,
      read: false,
    );
    _set(
      state.copyWith(
        vehicle: vehicle,
        history: [_location(vehicle)],
        geofences: [zone],
        securityEvents: [
          SecurityEvent(
            id: _id('sec'),
            vehicleId: vehicle.id,
            type: SecurityEventType.armed,
            severity: AlertSeverity.info,
            confidenceScore: assessment.score,
            status: 'open',
            createdAt: now,
            title: 'Security armed',
            factors: assessment.factors,
          ),
        ],
        notifications: [notice],
        movementActive: false,
        geofenceAlerted: false,
      ),
    );
    return vehicle;
  }

  Future<VehicleCommand> sendCommand({
    required VehicleCommandType type,
    required String userId,
    required String idempotencyKey,
  }) async {
    for (final existing in state.commands) {
      if (existing.idempotencyKey == idempotencyKey &&
          existing.status == CommandStatus.executed) {
        return existing;
      }
    }
    final vehicle = state.vehicle;
    if (vehicle == null) {
      throw const AppException('Pair a vehicle before sending a command.');
    }
    if (!vehicle.online) {
      throw const AppException('Vehicle device offline');
    }

    var command = VehicleCommand(
      id: _id('cmd'),
      vehicleId: vehicle.id,
      userId: userId,
      type: type,
      idempotencyKey: idempotencyKey,
      status: CommandStatus.pending,
      createdAt: DateTime.now(),
      detail: 'Waiting for the command service.',
    );
    _upsertCommand(command);
    await Future<void>.delayed(const Duration(milliseconds: 650));
    command = command.copyWith(
      status: CommandStatus.sent,
      detail: 'Sent to the vehicle.',
    );
    _upsertCommand(command);
    await Future<void>.delayed(const Duration(milliseconds: 750));
    _applyCommand(type);
    command = command.copyWith(
      status: CommandStatus.executed,
      detail: _commandDetail(type),
    );
    _upsertCommand(command);
    return command;
  }

  void simulateTheft() {
    final vehicle = state.vehicle;
    if (vehicle == null) return;
    final now = DateTime.now();
    final moved = vehicle.copyWith(
      latitude: vehicle.latitude + 0.0055,
      speedKph: 36,
      armed: true,
      updatedAt: now,
      address: 'Outside home zone, Addis Ababa',
    );
    final outside = _outside(moved);
    final assessment = RiskModel.assess(
      movingWhileArmed: true,
      ownerSessionActive: false,
      outsideGeofence: outside,
      at: now,
    );
    final updated = moved.copyWith(
      riskScore: assessment.score,
      riskLevel: assessment.level,
      riskFactors: assessment.factors,
    );
    final event = SecurityEvent(
      id: _id('sec'),
      vehicleId: vehicle.id,
      type: SecurityEventType.unauthorizedMovement,
      severity: AlertSeverity.critical,
      confidenceScore: assessment.score,
      status: 'open',
      createdAt: now,
      title: 'Unauthorized movement',
      factors: assessment.factors,
    );
    final notice = AppNotification(
      id: _id('ntf'),
      title: 'Critical: unauthorized movement',
      body: 'Risk ${assessment.score}. ${assessment.factors.join(' · ')}',
      severity: AlertSeverity.critical,
      createdAt: now,
      read: false,
    );
    final events = [event, ...state.securityEvents];
    if (outside) {
      events.insert(
        0,
        SecurityEvent(
          id: _id('sec'),
          vehicleId: vehicle.id,
          type: SecurityEventType.geofenceExit,
          severity: AlertSeverity.warning,
          confidenceScore: assessment.score,
          status: 'open',
          createdAt: now,
          title: 'Left home geofence',
          factors: const ['Outside home geofence'],
        ),
      );
    }
    _set(
      state.copyWith(
        vehicle: updated,
        history: [_location(updated), ...state.history].take(40).toList(),
        securityEvents: events,
        notifications: [notice, ...state.notifications],
        movementActive: true,
        geofenceAlerted: outside,
      ),
    );
    _ensureTimer();
  }

  void simulateCrash() {
    final vehicle = state.vehicle;
    if (vehicle == null) return;
    final now = DateTime.now();
    final event = EmergencyEvent(
      id: _id('emg'),
      vehicleId: vehicle.id,
      type: EmergencyType.crash,
      severity: AlertSeverity.critical,
      status: 'open',
      createdAt: now,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      summary: 'Impact pattern detected. No button press required.',
    );
    final notice = AppNotification(
      id: _id('ntf'),
      title: 'Crash detected',
      body: 'A high-G impact was detected near ${vehicle.address}.',
      severity: AlertSeverity.critical,
      createdAt: now,
      read: false,
    );
    _set(
      state.copyWith(
        movementActive: false,
        vehicle: vehicle.copyWith(speedKph: 0, updatedAt: now),
        emergencyEvents: [event, ...state.emergencyEvents],
        notifications: [notice, ...state.notifications],
      ),
    );
    _moveTimer?.cancel();
    _moveTimer = null;
  }

  void triggerSos() {
    final vehicle = state.vehicle;
    if (vehicle == null) {
      throw const AppException('Pair a vehicle before sending SOS.');
    }
    final now = DateTime.now();
    final event = EmergencyEvent(
      id: _id('emg'),
      vehicleId: vehicle.id,
      type: EmergencyType.sos,
      severity: AlertSeverity.critical,
      status: 'open',
      createdAt: now,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      summary: 'Manual SOS sent to ${AppConstants.emergencyContact}.',
    );
    final notice = AppNotification(
      id: _id('ntf'),
      title: 'SOS sent',
      body: 'Emergency contact ${AppConstants.emergencyContact} was notified.',
      severity: AlertSeverity.critical,
      createdAt: now,
      read: false,
    );
    _set(
      state.copyWith(
        emergencyEvents: [event, ...state.emergencyEvents],
        notifications: [notice, ...state.notifications],
      ),
    );
  }

  void addGeofence({required String name, required double radiusMeters}) {
    final vehicle = state.vehicle;
    if (vehicle == null) {
      throw const AppException('Pair a vehicle before adding a zone.');
    }
    final zone = Geofence(
      id: _id('geo'),
      vehicleId: vehicle.id,
      name: name.trim(),
      centerLat: vehicle.latitude,
      centerLng: vehicle.longitude,
      radiusMeters: radiusMeters,
      active: true,
      polygon: Geofence.circlePolygon(
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        radiusMeters: radiusMeters,
      ),
    );
    _set(state.copyWith(geofences: [zone, ...state.geofences]));
  }

  void toggleGeofence(String id) {
    final next = [
      for (final zone in state.geofences)
        if (zone.id == id) zone.copyWith(active: !zone.active) else zone,
    ];
    _set(state.copyWith(geofences: next));
  }

  void markNotificationRead(String id) {
    final next = [
      for (final item in state.notifications)
        if (item.id == id) item.copyWith(read: true) else item,
    ];
    _set(state.copyWith(notifications: next));
  }

  void markAllNotificationsRead() {
    _set(
      state.copyWith(
        notifications: [
          for (final item in state.notifications) item.copyWith(read: true),
        ],
      ),
    );
  }

  void _applyCommand(VehicleCommandType type) {
    final vehicle = state.vehicle;
    if (vehicle == null) return;
    final now = DateTime.now();
    switch (type) {
      case VehicleCommandType.arm:
        _set(
          state.copyWith(
            vehicle: vehicle.copyWith(armed: true, updatedAt: now),
            movementActive: false,
          ),
        );
        _stopTimer();
      case VehicleCommandType.disarm:
        final calm = RiskModel.assess(
          movingWhileArmed: false,
          ownerSessionActive: true,
          outsideGeofence: _outside(vehicle),
          at: now,
        );
        _set(
          state.copyWith(
            vehicle: vehicle.copyWith(
              armed: false,
              speedKph: 0,
              riskScore: calm.score,
              riskLevel: calm.level,
              riskFactors: calm.factors,
              updatedAt: now,
            ),
            movementActive: false,
          ),
        );
        _stopTimer();
      case VehicleCommandType.immobilize:
        _set(
          state.copyWith(
            vehicle: vehicle.copyWith(
              immobilized: true,
              speedKph: 0,
              riskScore: 64,
              riskLevel: RiskLevel.medium,
              riskFactors: const [
                'Immobilizer active',
                'Unauthorized movement recorded',
              ],
              updatedAt: now,
            ),
            movementActive: false,
            notifications: [
              AppNotification(
                id: _id('ntf'),
                title: 'Vehicle immobilized',
                body: 'The relay opened the accessory circuit.',
                severity: AlertSeverity.warning,
                createdAt: now,
                read: false,
              ),
              ...state.notifications,
            ],
          ),
        );
        _stopTimer();
      case VehicleCommandType.release:
        final calm = RiskModel.assess(
          movingWhileArmed: false,
          ownerSessionActive: true,
          outsideGeofence: _outside(vehicle),
          at: now,
        );
        _set(
          state.copyWith(
            vehicle: vehicle.copyWith(
              immobilized: false,
              riskScore: calm.score,
              riskLevel: calm.level,
              riskFactors: calm.factors,
              updatedAt: now,
            ),
          ),
        );
      case VehicleCommandType.status:
        _set(
          state.copyWith(
            notifications: [
              AppNotification(
                id: _id('ntf'),
                title: 'Status received',
                body:
                    '${vehicle.online ? 'Online' : 'Offline'} · battery ${vehicle.batteryPercent}% · firmware ${vehicle.firmwareVersion}',
                severity: AlertSeverity.info,
                createdAt: now,
                read: false,
              ),
              ...state.notifications,
            ],
          ),
        );
    }
  }

  void _tick() {
    final vehicle = state.vehicle;
    if (vehicle == null || !state.movementActive || vehicle.immobilized) {
      _stopTimer();
      return;
    }
    final now = DateTime.now();
    final moved = vehicle.copyWith(
      latitude: vehicle.latitude + 0.0009,
      longitude: vehicle.longitude + 0.0004,
      speedKph: 34,
      updatedAt: now,
    );
    final outside = _outside(moved);
    final assessment = RiskModel.assess(
      movingWhileArmed: vehicle.armed,
      ownerSessionActive: false,
      outsideGeofence: outside,
      at: now,
    );
    var events = state.securityEvents;
    var notices = state.notifications;
    var alerted = state.geofenceAlerted;
    if (outside && !alerted) {
      alerted = true;
      events = [
        SecurityEvent(
          id: _id('sec'),
          vehicleId: vehicle.id,
          type: SecurityEventType.geofenceExit,
          severity: AlertSeverity.warning,
          confidenceScore: assessment.score,
          status: 'open',
          createdAt: now,
          title: 'Left home geofence',
          factors: const ['Outside home geofence'],
        ),
        ...events,
      ];
      notices = [
        AppNotification(
          id: _id('ntf'),
          title: 'Geofence exit',
          body: 'The vehicle left an active zone.',
          severity: AlertSeverity.warning,
          createdAt: now,
          read: false,
        ),
        ...notices,
      ];
    }
    _set(
      state.copyWith(
        vehicle: moved.copyWith(
          riskScore: assessment.score,
          riskLevel: assessment.level,
          riskFactors: assessment.factors,
          address: outside ? 'Outside home zone, Addis Ababa' : vehicle.address,
        ),
        history: [_location(moved), ...state.history].take(40).toList(),
        securityEvents: events,
        notifications: notices,
        geofenceAlerted: alerted,
      ),
    );
  }

  void _ensureTimer() {
    if (!state.movementActive) {
      _stopTimer();
      return;
    }
    _moveTimer ??= Timer.periodic(const Duration(seconds: 2), (_) => _tick());
  }

  void _stopTimer() {
    _moveTimer?.cancel();
    _moveTimer = null;
  }

  void _upsertCommand(VehicleCommand command) {
    final remaining = [
      for (final item in state.commands)
        if (item.id != command.id) item,
    ];
    _set(state.copyWith(commands: [command, ...remaining]));
  }

  bool _outside(Vehicle vehicle) {
    for (final zone in state.geofences) {
      if (!zone.active) continue;
      final distance = _distanceMeters(
        vehicle.latitude,
        vehicle.longitude,
        zone.centerLat,
        zone.centerLng,
      );
      if (distance > zone.radiusMeters) return true;
    }
    return false;
  }

  PilotData _demoSnapshot(User user) {
    final now = DateTime.now();
    final assessment = RiskModel.assess(
      movingWhileArmed: false,
      ownerSessionActive: true,
      outsideGeofence: false,
      at: now,
    );
    final vehicle = Vehicle(
      id: 'veh-pilot',
      ownerId: user.id,
      deviceId: 'dev-pilot',
      serialNo: 'SMROD-001',
      make: 'Toyota',
      model: 'Land Cruiser',
      plateNo: 'AA-3-4821',
      armed: true,
      immobilized: false,
      online: true,
      powerCut: false,
      doorOpen: false,
      batteryPercent: 86,
      backupBatteryPercent: 100,
      firmwareVersion: '1.0.0',
      latitude: AppConstants.homeLatitude,
      longitude: AppConstants.homeLongitude,
      speedKph: 0,
      address: 'Bole, Addis Ababa',
      riskScore: assessment.score,
      riskLevel: assessment.level,
      riskFactors: assessment.factors,
      updatedAt: now,
    );
    final history = List<VehicleLocation>.generate(6, (index) {
      final stamp = now.subtract(Duration(minutes: (6 - index) * 8));
      return VehicleLocation(
        vehicleId: vehicle.id,
        latitude: AppConstants.homeLatitude - (0.004 - index * 0.0007),
        longitude: AppConstants.homeLongitude - 0.002 + index * 0.0003,
        speedKph: index == 5 ? 0 : 28,
        timestamp: stamp,
        address: 'Bole, Addis Ababa',
      );
    });
    return state.copyWith(
      vehicle: vehicle,
      history: history.reversed.toList(),
      geofences: [_homeZone(vehicle)],
      securityEvents: [
        SecurityEvent(
          id: 'sec-armed',
          vehicleId: vehicle.id,
          type: SecurityEventType.armed,
          severity: AlertSeverity.info,
          confidenceScore: assessment.score,
          status: 'open',
          createdAt: now.subtract(const Duration(hours: 2)),
          title: 'Security armed',
          factors: assessment.factors,
        ),
      ],
      notifications: [
        AppNotification(
          id: 'ntf-critical',
          title: 'Possible theft',
          body: 'The armed vehicle is moving outside the home zone.',
          severity: AlertSeverity.critical,
          createdAt: now.subtract(const Duration(minutes: 4)),
          read: false,
        ),
        AppNotification(
          id: 'ntf-warning',
          title: 'Left home zone',
          body: 'The vehicle crossed the home geofence.',
          severity: AlertSeverity.warning,
          createdAt: now.subtract(const Duration(minutes: 18)),
          read: false,
        ),
        AppNotification(
          id: 'ntf-online',
          title: 'Device online',
          body: 'The control unit checked in. Battery 86%.',
          severity: AlertSeverity.info,
          createdAt: now.subtract(const Duration(minutes: 40)),
          read: false,
        ),
      ],
      movementActive: false,
      geofenceAlerted: false,
    );
  }

  Geofence _homeZone(Vehicle vehicle) {
    const radius = 400.0;
    return Geofence(
      id: 'geo-home',
      vehicleId: vehicle.id,
      name: 'Home',
      centerLat: AppConstants.homeLatitude,
      centerLng: AppConstants.homeLongitude,
      radiusMeters: radius,
      active: true,
      polygon: Geofence.circlePolygon(
        latitude: AppConstants.homeLatitude,
        longitude: AppConstants.homeLongitude,
        radiusMeters: radius,
      ),
    );
  }

  VehicleLocation _location(Vehicle vehicle) {
    return VehicleLocation(
      vehicleId: vehicle.id,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      speedKph: vehicle.speedKph,
      timestamp: vehicle.updatedAt,
      address: vehicle.address,
    );
  }

  void _set(PilotData data) {
    state = data;
    LocalStorageService.instance.setString(
      AppConstants.pilotSnapshotKey,
      jsonEncode(data.toJson()),
    );
  }

  String _id(String prefix) => '$prefix-${DateTime.now().microsecondsSinceEpoch}';

  String _commandDetail(VehicleCommandType type) {
    return switch (type) {
      VehicleCommandType.arm => 'Security is armed.',
      VehicleCommandType.disarm => 'Security is disarmed.',
      VehicleCommandType.immobilize => 'Relay opened. Vehicle immobilized.',
      VehicleCommandType.release => 'Relay closed. Circuit restored.',
      VehicleCommandType.status => 'Device status received.',
    };
  }
}

double _distanceMeters(double lat1, double lon1, double lat2, double lon2) {
  const earth = 6371000.0;
  final dLat = _rad(lat2 - lat1);
  final dLon = _rad(lon2 - lon1);
  final a =
      math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_rad(lat1)) * math.cos(_rad(lat2)) * math.sin(dLon / 2) * math.sin(dLon / 2);
  return 2 * earth * math.asin(math.sqrt(a));
}

double _rad(double degrees) => degrees * math.pi / 180;

final pilotStoreProvider = NotifierProvider<PilotStore, PilotData>(PilotStore.new);
