import '../../../../core/errors/failure.dart';
import '../../../authentication/domain/entities/user.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Pair vehicle use case.
class PairVehicle {
  const PairVehicle(this._repository);

  final VehicleRepository _repository;

  Future<Result<Vehicle>> call({
    required User owner,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) {
    return _repository.pair(
      owner: owner,
      serialNo: serialNo,
      make: make,
      model: model,
      plateNo: plateNo,
    );
  }
}
