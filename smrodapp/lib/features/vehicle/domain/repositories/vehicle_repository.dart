import '../../../../core/errors/failure.dart';
import '../entities/vehicle.dart';

/// Vehicle repository contract.
abstract class VehicleRepository {
  Future<Result<Vehicle>> getVehicle(String ownerId);

  Future<Result<Vehicle>> pair({
    required String ownerId,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  });
}
