import '../../../../core/constants/app_constants.dart';

/// Explainable V1 risk model. Weights are versioned so a score can be audited.
class RiskModel {
  const RiskModel._();

  static const version = '1.0.0';
  static const movementWeight = 45;
  static const timeWeight = 25;
  static const locationWeight = 30;

  static RiskAssessment assess({
    required bool movingWhileArmed,
    required bool ownerSessionActive,
    required bool outsideGeofence,
    required DateTime at,
  }) {
    var score = 0;
    final factors = <String>[];

    if (movingWhileArmed && !ownerSessionActive) {
      score += movementWeight;
      factors.add('Movement while armed, no owner session');
    } else if (movingWhileArmed) {
      score += 10;
      factors.add('Movement during an owner session');
    } else {
      factors.add('No unauthorized motion');
    }

    final hour = at.hour;
    if (hour < 5 || hour >= 22) {
      score += timeWeight;
      factors.add('Unusual hour');
    } else {
      score += 8;
      factors.add('Daytime pattern');
    }

    if (outsideGeofence) {
      score += locationWeight;
      factors.add('Outside home geofence');
    } else {
      factors.add('Inside home geofence');
    }

    score = score.clamp(0, 100);
    final level = score >= 71
        ? RiskLevel.critical
        : score >= 31
        ? RiskLevel.medium
        : RiskLevel.low;
    return RiskAssessment(score: score, level: level, factors: factors);
  }
}

class RiskAssessment {
  const RiskAssessment({
    required this.score,
    required this.level,
    required this.factors,
  });

  final int score;
  final RiskLevel level;
  final List<String> factors;
}

enum SecurityEventType {
  unauthorizedMovement,
  tamper,
  powerLoss,
  geofenceExit,
  geofenceEntry,
  armed,
  deviceStatus,
}

enum VehicleCommandType { arm, disarm, immobilize, release, status }

enum CommandStatus { pending, sent, executed, failed, expired }

/// Security event entity.
class SecurityEvent {
  const SecurityEvent({
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
  final SecurityEventType type;
  final AlertSeverity severity;
  final int confidenceScore;
  final String status;
  final DateTime createdAt;
  final String title;
  final List<String> factors;
}

/// Remote command recorded for audit.
class VehicleCommand {
  const VehicleCommand({
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
  final VehicleCommandType type;
  final String idempotencyKey;
  final CommandStatus status;
  final DateTime createdAt;
  final String detail;

  VehicleCommand copyWith({CommandStatus? status, String? detail}) {
    return VehicleCommand(
      id: id,
      vehicleId: vehicleId,
      userId: userId,
      type: type,
      idempotencyKey: idempotencyKey,
      status: status ?? this.status,
      createdAt: createdAt,
      detail: detail ?? this.detail,
    );
  }
}
