import '../../../../core/constants/app_constants.dart';

/// Vehicle entity.
class Vehicle {
  const Vehicle({
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
  final RiskLevel riskLevel;
  final List<String> riskFactors;
  final DateTime updatedAt;

  String get title => '$make $model';

  Vehicle copyWith({
    bool? armed,
    bool? immobilized,
    bool? online,
    bool? powerCut,
    bool? doorOpen,
    int? batteryPercent,
    double? latitude,
    double? longitude,
    double? speedKph,
    String? address,
    int? riskScore,
    RiskLevel? riskLevel,
    List<String>? riskFactors,
    DateTime? updatedAt,
  }) {
    return Vehicle(
      id: id,
      ownerId: ownerId,
      deviceId: deviceId,
      serialNo: serialNo,
      make: make,
      model: model,
      plateNo: plateNo,
      armed: armed ?? this.armed,
      immobilized: immobilized ?? this.immobilized,
      online: online ?? this.online,
      powerCut: powerCut ?? this.powerCut,
      doorOpen: doorOpen ?? this.doorOpen,
      batteryPercent: batteryPercent ?? this.batteryPercent,
      backupBatteryPercent: backupBatteryPercent,
      firmwareVersion: firmwareVersion,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      speedKph: speedKph ?? this.speedKph,
      address: address ?? this.address,
      riskScore: riskScore ?? this.riskScore,
      riskLevel: riskLevel ?? this.riskLevel,
      riskFactors: riskFactors ?? this.riskFactors,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
