import '../../domain/entities/vehicle_location.dart';

/// Location data model.
class LocationModel {
  const LocationModel({
    required this.vehicleId,
    required this.latitude,
    required this.longitude,
    required this.speedKph,
    required this.timestamp,
    required this.address,
  });

  final String vehicleId;
  final double latitude;
  final double longitude;
  final double speedKph;
  final DateTime timestamp;
  final String address;

  factory LocationModel.fromEntity(VehicleLocation location) {
    return LocationModel(
      vehicleId: location.vehicleId,
      latitude: location.latitude,
      longitude: location.longitude,
      speedKph: location.speedKph,
      timestamp: location.timestamp,
      address: location.address,
    );
  }

  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      vehicleId: (json['vehicleId'] ?? json['vehicle_id']) as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      speedKph: (json['speedKph'] ?? json['speed'] as num?)?.toDouble() ?? 0,
      timestamp: DateTime.parse((json['timestamp'] ?? json['createdAt']) as String),
      address: (json['address'] ?? '') as String,
    );
  }

  VehicleLocation toEntity() {
    return VehicleLocation(
      vehicleId: vehicleId,
      latitude: latitude,
      longitude: longitude,
      speedKph: speedKph,
      timestamp: timestamp,
      address: address,
    );
  }

  Map<String, dynamic> toJson() => {
    'vehicleId': vehicleId,
    'latitude': latitude,
    'longitude': longitude,
    'speed': speedKph,
    'timestamp': timestamp.toIso8601String(),
    'address': address,
  };
}
