/// Vehicle location entity.
class VehicleLocation {
  const VehicleLocation({
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
}
