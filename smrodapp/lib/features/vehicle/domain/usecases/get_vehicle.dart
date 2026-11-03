import '../../../../core/errors/failure.dart';
import '../entities/vehicle.dart';
import '../repositories/vehicle_repository.dart';

/// Get vehicle use case.
class GetVehicle {
  const GetVehicle(this._repository);

  final VehicleRepository _repository;

  Future<Result<Vehicle>> call(String ownerId) => _repository.getVehicle(ownerId);
}
