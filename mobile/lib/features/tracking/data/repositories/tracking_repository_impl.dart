import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/failure.dart';
import '../../domain/entities/vehicle_location.dart';
import '../../domain/repositories/tracking_repository.dart';
import '../datasources/tracking_remote_datasource.dart';

/// Tracking repository implementation.
class TrackingRepositoryImpl implements TrackingRepository {
  TrackingRepositoryImpl(this._remote);

  final TrackingRemoteDataSource _remote;

  @override
  Future<Result<VehicleLocation>> live(String ownerId) async {
    try {
      final model = await _remote.live(ownerId);
      return Success(model.toEntity());
    } on AppException catch (error) {
      return ErrorResult(NetworkFailure(error.message));
    }
  }

  @override
  Future<Result<List<VehicleLocation>>> history(String ownerId) async {
    try {
      final models = await _remote.history(ownerId);
      return Success(models.map((item) => item.toEntity()).toList());
    } on AppException catch (error) {
      return ErrorResult(NetworkFailure(error.message));
    }
  }
}
