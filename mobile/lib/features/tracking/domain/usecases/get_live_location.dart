import '../../../../core/errors/failure.dart';
import '../entities/vehicle_location.dart';
import '../repositories/tracking_repository.dart';

/// Get live location use case.
class GetLiveLocation {
  const GetLiveLocation(this._repository);

  final TrackingRepository _repository;

  Future<Result<VehicleLocation>> call(String ownerId) => _repository.live(ownerId);
}
