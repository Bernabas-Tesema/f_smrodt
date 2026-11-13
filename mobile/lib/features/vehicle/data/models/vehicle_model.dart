import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/vehicle.dart';

/// Vehicle data model.
class VehicleModel {
  const VehicleModel({
    required this.id,
    required this.ownerId,
    required this.deviceId,
    required this.serialNo,
    required this.make,
    required this.model,
    required this.plateNo,
    required this.armed,
    required this.immobilized,
    required this.online,
    required this.powerCut,
    required this.doorOpen,
    required this.batteryPercent,
    required this.backupBatteryPercent,
    required this.firmwareVersion,
    required this.latitude,
    required this.longitude,
    required this.speedKph,
    required this.address,
    required this.riskScore,
    required this.riskLevel,
    required this.riskFactors,
    required this.updatedAt,
  });

  final String id;
  final String ownerId;
  final String deviceId;
  final String serialNo;
  final String make;
  final String model;
  final String plateNo;
  final bool armed;
  final bool immobilized;
  final bool online;
  final bool powerCut;
  final bool doorOpen;
  final int batteryPercent;
  final int backupBatteryPercent;
  final String firmwareVersion;
  final double latitude;
  final double longitude;
  final double speedKph;
  final String address;
  final int riskScore;
  final String riskLevel;
  final List<String> riskFactors;
  final DateTime updatedAt;

  factory VehicleModel.fromEntity(Vehicle vehicle) {
    return VehicleModel(
      id: vehicle.id,
      ownerId: vehicle.ownerId,
      deviceId: vehicle.deviceId,
      serialNo: vehicle.serialNo,
      make: vehicle.make,
      model: vehicle.model,
      plateNo: vehicle.plateNo,
      armed: vehicle.armed,
      immobilized: vehicle.immobilized,
      online: vehicle.online,
      powerCut: vehicle.powerCut,
      doorOpen: vehicle.doorOpen,
      batteryPercent: vehicle.batteryPercent,
      backupBatteryPercent: vehicle.backupBatteryPercent,
      firmwareVersion: vehicle.firmwareVersion,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
      speedKph: vehicle.speedKph,
      address: vehicle.address,
      riskScore: vehicle.riskScore,
      riskLevel: vehicle.riskLevel.name,
      riskFactors: vehicle.riskFactors,
      updatedAt: vehicle.updatedAt,
    );
  }

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    final factors = (json['riskFactors'] as List<dynamic>? ?? const [])
        .map((item) => item.toString())
        .toList();
    return VehicleModel(
      id: json['id'] as String,
      ownerId: (json['ownerId'] ?? json['owner_id']) as String,
      deviceId: (json['deviceId'] ?? json['device_id']) as String,
      serialNo: (json['serialNo'] ?? json['serial_no']) as String,
      make: json['make'] as String,
      model: json['model'] as String,
      plateNo: (json['plateNo'] ?? json['plate_no']) as String,
      armed: json['armed'] as bool? ?? true,
      immobilized: json['immobilized'] as bool? ?? false,
      online: json['online'] as bool? ?? true,
      powerCut: json['powerCut'] as bool? ?? false,
      doorOpen: json['doorOpen'] as bool? ?? false,
      batteryPercent: (json['batteryPercent'] as num?)?.toInt() ?? 0,
      backupBatteryPercent: (json['backupBatteryPercent'] as num?)?.toInt() ?? 0,
      firmwareVersion: (json['firmwareVersion'] ?? json['firmware_version'] ?? '') as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      speedKph: (json['speedKph'] as num?)?.toDouble() ?? 0,
      address: (json['address'] ?? '') as String,
      riskScore: (json['riskScore'] as num?)?.toInt() ?? 0,
      riskLevel: (json['riskLevel'] ?? 'low') as String,
      riskFactors: factors,
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Vehicle toEntity() {
    return Vehicle(
      id: id,
      ownerId: ownerId,
      deviceId: deviceId,
      serialNo: serialNo,
      make: make,
      model: model,
      plateNo: plateNo,
      armed: armed,
      immobilized: immobilized,
      online: online,
      powerCut: powerCut,
      doorOpen: doorOpen,
      batteryPercent: batteryPercent,
      backupBatteryPercent: backupBatteryPercent,
      firmwareVersion: firmwareVersion,
      latitude: latitude,
      longitude: longitude,
      speedKph: speedKph,
      address: address,
      riskScore: riskScore,
      riskLevel: RiskLevel.values.byName(riskLevel),
      riskFactors: riskFactors,
      updatedAt: updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'ownerId': ownerId,
    'deviceId': deviceId,
    'serialNo': serialNo,
    'make': make,
    'model': model,
    'plateNo': plateNo,
    'armed': armed,
    'immobilized': immobilized,
    'online': online,
    'powerCut': powerCut,
    'doorOpen': doorOpen,
    'batteryPercent': batteryPercent,
    'backupBatteryPercent': backupBatteryPercent,
    'firmwareVersion': firmwareVersion,
    'latitude': latitude,
    'longitude': longitude,
    'speedKph': speedKph,
    'address': address,
    'riskScore': riskScore,
    'riskLevel': riskLevel,
    'riskFactors': riskFactors,
    'updatedAt': updatedAt.toIso8601String(),
  };
}
