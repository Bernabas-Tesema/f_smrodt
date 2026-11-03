import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/failure.dart';
import '../../domain/entities/security_event.dart';
import '../../domain/repositories/security_repository.dart';
import '../datasources/security_remote_datasource.dart';

/// Security repository implementation.
class SecurityRepositoryImpl implements SecurityRepository {
  SecurityRepositoryImpl(this._remote);

  final SecurityRemoteDataSource _remote;

  @override
  Future<Result<List<SecurityEvent>>> events(String ownerId) async {
    try {
      final models = await _remote.events(ownerId);
      return Success(models.map((item) => item.toEntity()).toList());
    } on AppException catch (error) {
      return ErrorResult(ServerFailure(error.message));
    }
  }

  @override
  Future<Result<VehicleCommand>> sendCommand({
    required VehicleCommandType type,
    required String userId,
    required String idempotencyKey,
  }) async {
    try {
      final model = await _remote.sendCommand(
        type: type,
        userId: userId,
        idempotencyKey: idempotencyKey,
      );
      return Success(model.toEntity());
    } on AppException catch (error) {
      return ErrorResult(CommandFailure(error.message));
    }
  }
}
