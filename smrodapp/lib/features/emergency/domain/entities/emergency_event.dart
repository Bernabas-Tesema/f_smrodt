import '../../../../core/constants/app_constants.dart';

enum EmergencyType { crash, sos }

/// Emergency event entity.
class EmergencyEvent {
  const EmergencyEvent({
    required this.id,
    required this.vehicleId,
    required this.type,
    required this.severity,
    required this.status,
    required this.createdAt,
    required this.latitude,
    required this.longitude,
    required this.summary,
  });

  final String id;
  final String vehicleId;
  final EmergencyType type;
  final AlertSeverity severity;
  final String status;
  final DateTime createdAt;
  final double latitude;
  final double longitude;
  final String summary;
}
