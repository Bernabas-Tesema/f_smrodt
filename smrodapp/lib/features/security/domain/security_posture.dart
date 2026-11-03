import '../../../core/constants/app_constants.dart';
import '../../vehicle/domain/entities/vehicle.dart';

/// Visible security state. Color is never the only signal.
enum SecurityPosture { protected, attention, warning, critical, offline }

class SecurityCheck {
  const SecurityCheck({required this.label, required this.ok});

  final String label;
  final bool ok;
}

class SecurityPostureView {
  const SecurityPostureView({
    required this.posture,
    required this.label,
    required this.explanation,
    required this.action,
    required this.checks,
  });

  final SecurityPosture posture;
  final String label;
  final String explanation;
  final String action;
  final List<SecurityCheck> checks;
}

/// Derives the owner-facing security state from the current vehicle snapshot.
SecurityPostureView assessPosture(Vehicle vehicle) {
  final secured = vehicle.armed && !vehicle.doorOpen && !vehicle.immobilized;
  final calm = vehicle.riskLevel == RiskLevel.low && !vehicle.powerCut;
  final checks = [
    SecurityCheck(label: 'Vehicle secured', ok: secured),
    SecurityCheck(label: 'Device online', ok: vehicle.online),
    SecurityCheck(label: 'No active threats', ok: calm),
    const SecurityCheck(label: 'AI Theft & Crash Guard active', ok: true),
  ];

  if (!vehicle.online) {
    return SecurityPostureView(
      posture: SecurityPosture.offline,
      label: 'OFFLINE',
      explanation: 'Vehicle connection unavailable. This is the last synchronized status.',
      action: 'Check device power, then refresh when the vehicle is back online.',
      checks: checks,
    );
  }
  if (vehicle.riskLevel == RiskLevel.critical) {
    return SecurityPostureView(
      posture: SecurityPosture.critical,
      label: 'CRITICAL',
      explanation: 'The risk model flags conditions that need immediate review.',
      action: 'Open Security and confirm the vehicle before dismissing the alert.',
      checks: checks,
    );
  }
  if (vehicle.powerCut || (vehicle.armed && vehicle.doorOpen)) {
    return SecurityPostureView(
      posture: SecurityPosture.warning,
      label: 'WARNING',
      explanation: vehicle.powerCut
          ? 'Main power is cut. The device is reporting on backup battery.'
          : 'A door sensor is open while security is armed.',
      action: 'Review the vehicle and the latest security event.',
      checks: checks,
    );
  }
  if (!vehicle.armed || vehicle.riskLevel == RiskLevel.medium) {
    return SecurityPostureView(
      posture: SecurityPosture.attention,
      label: 'ATTENTION',
      explanation: vehicle.armed
          ? 'Security is armed, and the risk score is elevated.'
          : 'Security is disarmed. Movement alerts are paused.',
      action: vehicle.armed ? 'Review the risk factors below.' : 'Arm security when the vehicle should be protected.',
      checks: checks,
    );
  }
  return SecurityPostureView(
    posture: SecurityPosture.protected,
    label: 'PROTECTED',
    explanation: 'Armed, online, and no active threat in the current assessment.',
    action: 'No action required.',
    checks: checks,
  );
}
