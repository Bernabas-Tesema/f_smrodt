import '../../domain/entities/geofence.dart';

/// Geofence data model.
class GeofenceModel {
  const GeofenceModel({
    required this.id,
    required this.vehicleId,
    required this.name,
    required this.centerLat,
    required this.centerLng,
    required this.radiusMeters,
    required this.active,
    required this.polygon,
  });

  final String id;
  final String vehicleId;
  final String name;
  final double centerLat;
  final double centerLng;
  final double radiusMeters;
  final bool active;
  final List<List<double>> polygon;

  factory GeofenceModel.fromEntity(Geofence zone) {
    return GeofenceModel(
      id: zone.id,
      vehicleId: zone.vehicleId,
      name: zone.name,
      centerLat: zone.centerLat,
      centerLng: zone.centerLng,
      radiusMeters: zone.radiusMeters,
      active: zone.active,
      polygon: zone.polygon,
    );
  }

  factory GeofenceModel.fromJson(Map<String, dynamic> json) {
    final raw = json['polygon'] as List<dynamic>? ?? const [];
    final polygon = raw.map((point) {
      final pair = point as List<dynamic>;
      return [ (pair[0] as num).toDouble(), (pair[1] as num).toDouble() ];
    }).toList();
    return GeofenceModel(
      id: json['id'] as String,
      vehicleId: json['vehicleId'] as String,
      name: json['name'] as String,
      centerLat: (json['centerLat'] as num).toDouble(),
      centerLng: (json['centerLng'] as num).toDouble(),
      radiusMeters: (json['radiusMeters'] as num).toDouble(),
      active: json['active'] as bool? ?? true,
      polygon: polygon,
    );
  }

  Geofence toEntity() {
    return Geofence(
      id: id,
      vehicleId: vehicleId,
      name: name,
      centerLat: centerLat,
      centerLng: centerLng,
      radiusMeters: radiusMeters,
      active: active,
      polygon: polygon,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'vehicleId': vehicleId,
    'name': name,
    'centerLat': centerLat,
    'centerLng': centerLng,
    'radiusMeters': radiusMeters,
    'active': active,
    'polygon': polygon,
  };
}
