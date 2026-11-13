import '../../../../core/errors/failure.dart';
import '../entities/vehicle_location.dart';

/// Tracking repository contract.
abstract class TrackingRepository {
  Future<Result<VehicleLocation>> live(String ownerId);

  Future<Result<List<VehicleLocation>>> history(String ownerId);
}
