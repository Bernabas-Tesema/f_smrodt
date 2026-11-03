import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/emergency_event.dart';

/// Emergency event data model.
class EmergencyEventModel {
  const EmergencyEventModel({
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
  final String type;
  final String severity;
  final String status;
  final DateTime createdAt;
  final double latitude;
  final double longitude;
  final String summary;

  factory EmergencyEventModel.fromEntity(EmergencyEvent event) {
    return EmergencyEventModel(
      id: event.id,
      vehicleId: event.vehicleId,
      type: event.type.name,
      severity: event.severity.name,
      status: event.status,
      createdAt: event.createdAt,
      latitude: event.latitude,
      longitude: event.longitude,
      summary: event.summary,
    );
  }

  factory EmergencyEventModel.fromJson(Map<String, dynamic> json) {
    return EmergencyEventModel(
      id: json['id'] as String,
      vehicleId: json['vehicleId'] as String,
      type: json['type'] as String,
      severity: json['severity'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      summary: json['summary'] as String? ?? '',
    );
  }

  EmergencyEvent toEntity() {
    return EmergencyEvent(
      id: id,
      vehicleId: vehicleId,
      type: EmergencyType.values.byName(type),
      severity: AlertSeverity.values.byName(severity),
      status: status,
      createdAt: createdAt,
      latitude: latitude,
      longitude: longitude,
      summary: summary,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'vehicleId': vehicleId,
    'type': type,
    'severity': severity,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
    'latitude': latitude,
    'longitude': longitude,
    'summary': summary,
  };
}
