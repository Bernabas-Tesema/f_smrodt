import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/failure.dart';
import '../../../authentication/domain/entities/user.dart';
import '../../domain/entities/vehicle.dart';
import '../../domain/repositories/vehicle_repository.dart';
import '../datasources/vehicle_remote_datasource.dart';

/// Vehicle repository implementation.
class VehicleRepositoryImpl implements VehicleRepository {
  VehicleRepositoryImpl(this._remote);

  final VehicleRemoteDataSource _remote;

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
    required User owner,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) async {
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
