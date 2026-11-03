import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../domain/entities/vehicle.dart';
import '../../domain/repositories/vehicle_repository.dart';
import '../datasources/vehicle_remote_datasource.dart';

/// Vehicle repository implementation.
class VehicleRepositoryImpl implements VehicleRepository {
  VehicleRepositoryImpl(this._remote, this._store);

  final VehicleRemoteDataSource _remote;
  final PilotStore _store;

  @override
  Future<Result<Vehicle>> getVehicle(String ownerId) async {
    try {
      final model = await _remote.fetchVehicle(ownerId);
      return Success(model.toEntity());
    } on AppException catch (error) {
      return ErrorResult(ServerFailure(error.message));
    }
  }

  @override
  Future<Result<Vehicle>> pair({
    required String ownerId,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) async {
    String? email;
    for (final account in _store.snapshot.accounts) {
      if (account.id == ownerId) {
        email = account.email;
        break;
      }
    }
    final owner = email == null ? null : _store.findByEmail(email);
    if (owner == null) {
      return const ErrorResult(ServerFailure('Sign in again before pairing.'));
    }
    try {
      final paired = await _remote.pair(
        owner: owner,
        serialNo: serialNo,
        make: make,
        model: model,
        plateNo: plateNo,
      );
      return Success(paired.toEntity());
    } on AppException catch (error) {
      return ErrorResult(ServerFailure(error.message));
    }
  }
}
