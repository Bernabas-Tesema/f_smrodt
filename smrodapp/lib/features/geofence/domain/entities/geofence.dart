import 'dart:math' as math;

/// Geofence entity. A circle is stored as a polygon so the cloud contract stays polygonal.
class Geofence {
  const Geofence({
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

  Geofence copyWith({bool? active}) {
    return Geofence(
      id: id,
      vehicleId: vehicleId,
      name: name,
      centerLat: centerLat,
      centerLng: centerLng,
      radiusMeters: radiusMeters,
      active: active ?? this.active,
      polygon: polygon,
    );
  }

  static List<List<double>> circlePolygon({
    required double latitude,
    required double longitude,
    required double radiusMeters,
    int steps = 24,
  }) {
    const earth = 6371000.0;
    final points = <List<double>>[];
    for (var i = 0; i < steps; i++) {
      final bearing = 2 * math.pi * i / steps;
      final lat1 = _rad(latitude);
      final lon1 = _rad(longitude);
      final angular = radiusMeters / earth;
      final lat2 = math.asin(
        math.sin(lat1) * math.cos(angular) +
            math.cos(lat1) * math.sin(angular) * math.cos(bearing),
      );
      final lon2 =
          lon1 +
          math.atan2(
            math.sin(bearing) * math.sin(angular) * math.cos(lat1),
            math.cos(angular) - math.sin(lat1) * math.sin(lat2),
          );
      points.add([_deg(lat2), _deg(lon2)]);
    }
    return points;
  }

  static double _rad(double deg) => deg * math.pi / 180;
  static double _deg(double rad) => rad * 180 / math.pi;
}
