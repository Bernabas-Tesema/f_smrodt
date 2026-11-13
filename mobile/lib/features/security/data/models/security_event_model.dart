import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/security_event.dart';

/// Security event data model.
class SecurityEventModel {
  const SecurityEventModel({
    required this.id,
    required this.vehicleId,
    required this.type,
    required this.severity,
    required this.confidenceScore,
    required this.status,
    required this.createdAt,
    required this.title,
    required this.factors,
  });

  final String id;
  final String vehicleId;
  final String type;
  final String severity;
  final int confidenceScore;
  final String status;
  final DateTime createdAt;
  final String title;
  final List<String> factors;

  factory SecurityEventModel.fromEntity(SecurityEvent event) {
    return SecurityEventModel(
      id: event.id,
      vehicleId: event.vehicleId,
      type: event.type.name,
      severity: event.severity.name,
      confidenceScore: event.confidenceScore,
      status: event.status,
      createdAt: event.createdAt,
      title: event.title,
      factors: event.factors,
    );
  }

  factory SecurityEventModel.fromJson(Map<String, dynamic> json) {
    return SecurityEventModel(
      id: json['id'] as String,
      vehicleId: (json['vehicleId'] ?? json['vehicle_id']) as String,
      type: (json['type'] ?? json['event_type']) as String,
      severity: json['severity'] as String,
      confidenceScore: (json['confidenceScore'] ?? json['confidence_score'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'open',
      createdAt: DateTime.parse((json['createdAt'] ?? json['created_at']) as String),
      title: json['title'] as String? ?? 'Security event',
      factors: (json['factors'] as List<dynamic>? ?? const []).map((e) => e.toString()).toList(),
    );
  }

  SecurityEvent toEntity() {
    return SecurityEvent(
      id: id,
      vehicleId: vehicleId,
      type: SecurityEventType.values.byName(type),
      severity: AlertSeverity.values.byName(severity),
      confidenceScore: confidenceScore,
      status: status,
      createdAt: createdAt,
      title: title,
      factors: factors,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'vehicleId': vehicleId,
    'type': type,
    'severity': severity,
    'confidenceScore': confidenceScore,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
    'title': title,
    'factors': factors,
  };
}

class VehicleCommandModel {
  const VehicleCommandModel({
    required this.id,
    required this.vehicleId,
    required this.userId,
    required this.type,
    required this.idempotencyKey,
    required this.status,
    required this.createdAt,
    required this.detail,
  });

  final String id;
  final String vehicleId;
  final String userId;
  final String type;
  final String idempotencyKey;
  final String status;
  final DateTime createdAt;
  final String detail;

  factory VehicleCommandModel.fromEntity(VehicleCommand command) {
    return VehicleCommandModel(
      id: command.id,
      vehicleId: command.vehicleId,
      userId: command.userId,
      type: command.type.name,
      idempotencyKey: command.idempotencyKey,
      status: command.status.name,
      createdAt: command.createdAt,
      detail: command.detail,
    );
  }

  factory VehicleCommandModel.fromJson(Map<String, dynamic> json) {
    return VehicleCommandModel(
      id: json['id'] as String,
      vehicleId: json['vehicleId'] as String,
      userId: json['userId'] as String,
      type: json['type'] as String,
      idempotencyKey: json['idempotencyKey'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      detail: json['detail'] as String? ?? '',
    );
  }

  VehicleCommand toEntity() {
    return VehicleCommand(
      id: id,
      vehicleId: vehicleId,
      userId: userId,
      type: VehicleCommandType.values.byName(type),
      idempotencyKey: idempotencyKey,
      status: CommandStatus.values.byName(status),
      createdAt: createdAt,
      detail: detail,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'vehicleId': vehicleId,
    'userId': userId,
    'type': type,
    'idempotencyKey': idempotencyKey,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
    'detail': detail,
  };
}
