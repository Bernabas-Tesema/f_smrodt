import '../../../../core/errors/failure.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Pair vehicle use case.
class PairVehicle {
  const PairVehicle(this._repository);

  final VehicleRepository _repository;

  Future<Result<Vehicle>> call({
    required String ownerId,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) {
    return _repository.pair(
      ownerId: ownerId,
      serialNo: serialNo,
      make: make,
      model: model,
      plateNo: plateNo,
    );
  }
}
