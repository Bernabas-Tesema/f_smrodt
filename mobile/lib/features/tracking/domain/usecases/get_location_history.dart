import '../../../../core/errors/failure.dart';
import '../entities/vehicle_location.dart';
import '../repositories/tracking_repository.dart';

/// Get location history use case.
class GetLocationHistory {
  const GetLocationHistory(this._repository);

  final TrackingRepository _repository;

  Future<Result<List<VehicleLocation>>> call(String ownerId) => _repository.history(ownerId);
}
