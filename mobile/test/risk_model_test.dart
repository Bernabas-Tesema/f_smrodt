import 'package:flutter_test/flutter_test.dart';
import 'package:smrod_vehicle_app/core/constants/app_constants.dart';
import 'package:smrod_vehicle_app/features/security/domain/entities/security_event.dart';
import 'package:smrod_vehicle_app/features/security/domain/security_posture.dart';
import 'package:smrod_vehicle_app/features/vehicle/domain/entities/vehicle.dart';

void main() {
  test('armed movement outside a geofence at night is critical', () {
    final result = RiskModel.assess(
      movingWhileArmed: true,
      ownerSessionActive: false,
      outsideGeofence: true,
      at: DateTime(2026, 9, 27, 23, 30),
    );

    expect(result.level, RiskLevel.critical);
    expect(result.score, 100);
    expect(result.factors, contains('Movement while armed, no owner session'));
    expect(result.factors, contains('Outside home geofence'));
  });

  test('a still vehicle inside the zone stays low', () {
    final result = RiskModel.assess(
      movingWhileArmed: false,
      ownerSessionActive: true,
      outsideGeofence: false,
      at: DateTime(2026, 9, 27, 11),
    );

    expect(result.level, RiskLevel.low);
    expect(result.score, lessThan(31));
  });

  test('an armed online vehicle with low risk is protected', () {
    final view = assessPosture(_vehicle(online: true, armed: true, riskLevel: RiskLevel.low, riskScore: 8));
    expect(view.posture, SecurityPosture.protected);
    expect(view.label, 'PROTECTED');
  });

  test('an offline vehicle is not described as live', () {
    final view = assessPosture(_vehicle(online: false, armed: true, riskLevel: RiskLevel.low, riskScore: 8));
    expect(view.posture, SecurityPosture.offline);
    expect(view.explanation, contains('connection unavailable'));
  });
}

Vehicle _vehicle({
  required bool online,
  required bool armed,
  required RiskLevel riskLevel,
  required int riskScore,
}) {
  return Vehicle(
    id: 'v1',
    ownerId: 'o1',
    deviceId: 'd1',
    serialNo: 'SN-1',
    make: 'Toyota',
    model: 'Land Cruiser',
    plateNo: 'AA-3-4821',
    armed: armed,
    immobilized: false,
    online: online,
    powerCut: false,
    doorOpen: false,
    batteryPercent: 90,
    backupBatteryPercent: 80,
    firmwareVersion: '1.0.0',
    latitude: 9.03,
    longitude: 38.74,
    speedKph: 0,
    address: 'Addis Ababa',
    riskScore: riskScore,
    riskLevel: riskLevel,
    riskFactors: const ['No unauthorized motion'],
    updatedAt: DateTime(2026, 9, 30, 12),
  );
}
