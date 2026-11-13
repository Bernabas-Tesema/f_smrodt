import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/pilot_store.dart';
import '../models/location_model.dart';

/// Remote tracking data source.
class TrackingRemoteDataSource {
  const TrackingRemoteDataSource(this._api, this._store);

  final ApiClient _api;
  final PilotStore _store;

  Future<LocationModel> live(String ownerId) async {
    if (AppConstants.usePilotData) {
      final vehicle = _store.vehicleFor(ownerId);
      final current = _store.snapshot.currentLocation;
      if (vehicle == null || current == null) {
        throw const AppException('Location is not available yet.');
      }
      return LocationModel.fromEntity(current);
    }
    final response = await _guard(() => _api.get(ApiConstants.location));
    return LocationModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<List<LocationModel>> history(String ownerId) async {
    if (AppConstants.usePilotData) {
      final vehicle = _store.vehicleFor(ownerId);
      if (vehicle == null) return const [];
      return _store.snapshot.history
          .where((item) => item.vehicleId == vehicle.id)
          .map(LocationModel.fromEntity)
          .toList();
    }
    final response = await _guard(() => _api.get(ApiConstants.locationHistory));
    final data = response.data as List<dynamic>;
    return data
        .map((item) => LocationModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<Response<dynamic>> _guard(Future<Response<dynamic>> Function() call) async {
    try {
      return await call();
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Network failure');
    }
  }
}
