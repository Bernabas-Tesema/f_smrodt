import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/domain/entities/user.dart';
import '../models/vehicle_model.dart';

/// Remote vehicle data source.
class VehicleRemoteDataSource {
  const VehicleRemoteDataSource(this._api, this._store);

  final ApiClient _api;
  final PilotStore _store;

  Future<VehicleModel> fetchVehicle(String ownerId) async {
    if (AppConstants.usePilotData) {
      final vehicle = _store.vehicleFor(ownerId);
      if (vehicle == null) {
        throw const AppException('No vehicle paired yet.');
      }
      return VehicleModel.fromEntity(vehicle);
    }
    final response = await _guard(() => _api.get(ApiConstants.vehicle));
    return VehicleModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<VehicleModel> pair({
    required User owner,
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) async {
    if (AppConstants.usePilotData) {
      final vehicle = _store.pair(
        owner: owner,
        serialNo: serialNo,
        make: make,
        model: model,
        plateNo: plateNo,
      );
      return VehicleModel.fromEntity(vehicle);
    }
    final response = await _guard(
      () => _api.post(
        ApiConstants.pair,
        data: {'serialNo': serialNo, 'make': make, 'model': model, 'plateNo': plateNo},
      ),
    );
    return VehicleModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Response<dynamic>> _guard(Future<Response<dynamic>> Function() call) async {
    try {
      return await call();
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Network failure');
    }
  }
}
