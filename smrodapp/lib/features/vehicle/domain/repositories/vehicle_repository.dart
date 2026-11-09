import '../../../../core/errors/failure.dart';
import '../../../authentication/domain/entities/user.dart';
import '../entities/vehicle.dart';

/// Vehicle repository contract.
abstract class VehicleRepository {
  Future<Result<Vehicle>> getVehicle(String ownerId);

  Future<Result<Vehicle>> pair({
    required User owner,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  });
}
