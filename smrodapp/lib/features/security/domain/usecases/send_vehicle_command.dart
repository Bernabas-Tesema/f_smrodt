import '../../../../core/errors/failure.dart';
import '../entities/security_event.dart';
import '../repositories/security_repository.dart';

/// Send vehicle command use case.
class SendVehicleCommand {
  const SendVehicleCommand(this._repository);

  final SecurityRepository _repository;

  Future<Result<VehicleCommand>> call({
    required VehicleCommandType type,
    required String userId,
    required String idempotencyKey,
  }) {
    return _repository.sendCommand(
      type: type,
      userId: userId,
      idempotencyKey: idempotencyKey,
    );
  }
}
