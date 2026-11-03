import '../../../../core/errors/failure.dart';
import '../entities/security_event.dart';

/// Security repository contract.
abstract class SecurityRepository {
  Future<Result<List<SecurityEvent>>> events(String ownerId);

  Future<Result<VehicleCommand>> sendCommand({
    required VehicleCommandType type,
    required String userId,
    required String idempotencyKey,
  });
}
