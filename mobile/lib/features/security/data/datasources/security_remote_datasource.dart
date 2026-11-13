import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../domain/entities/security_event.dart';
import '../models/security_event_model.dart';

/// Remote security data source.
class SecurityRemoteDataSource {
  const SecurityRemoteDataSource(this._api, this._store);

  final ApiClient _api;
  final PilotStore _store;

  Future<List<SecurityEventModel>> events(String ownerId) async {
    if (AppConstants.usePilotData) {
      final vehicle = _store.vehicleFor(ownerId);
      if (vehicle == null) return const [];
      return _store.snapshot.securityEvents
          .where((event) => event.vehicleId == vehicle.id)
          .map(SecurityEventModel.fromEntity)
          .toList();
    }
    final response = await _guard(() => _api.get(ApiConstants.securityEvents));
    final data = response.data as List<dynamic>;
    return data
        .map((item) => SecurityEventModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<VehicleCommandModel> sendCommand({
    required VehicleCommandType type,
    required String userId,
    required String idempotencyKey,
  }) async {
    if (AppConstants.usePilotData) {
      final command = await _store.sendCommand(
        type: type,
        userId: userId,
        idempotencyKey: idempotencyKey,
      );
      return VehicleCommandModel.fromEntity(command);
    }
    final response = await _guard(
      () => _api.post(
        ApiConstants.commands,
        data: {'commandType': type.name},
        headers: {'Idempotency-Key': idempotencyKey},
      ),
    );
    return VehicleCommandModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<Response<dynamic>> _guard(Future<Response<dynamic>> Function() call) async {
    try {
      return await call();
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Network failure');
    }
  }
}
