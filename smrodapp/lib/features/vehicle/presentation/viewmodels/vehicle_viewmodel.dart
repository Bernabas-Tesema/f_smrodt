import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../domain/entities/vehicle.dart';
import '../providers/vehicle_provider.dart';

class VehicleState {
  const VehicleState({this.vehicle, this.loading = false, this.error});

  final Vehicle? vehicle;
  final bool loading;
  final String? error;
}

/// Vehicle view model.
class VehicleViewModel extends Notifier<VehicleState> {
  var _busy = false;
  String? _error;
  Vehicle? _remoteVehicle;
  String? _loadedOwnerId;

  @override
  VehicleState build() {
    final data = ref.watch(pilotStoreProvider);
    final user = ref.watch(authViewModelProvider).user;
    final current = data.vehicle;
    final vehicle = user != null && current?.ownerId == user.id
        ? current
        : _remoteVehicle?.ownerId == user?.id
        ? _remoteVehicle
        : null;
    if (user != null && !AppConstants.usePilotData && _loadedOwnerId != user.id) {
      _loadedOwnerId = user.id;
      Future.microtask(() async {
        final result = await ref.read(getVehicleProvider).call(user.id);
        result.fold((_) {}, (value) {
          _remoteVehicle = value;
          ref.invalidateSelf();
        });
      });
    }
    return VehicleState(vehicle: vehicle, loading: _busy, error: _error);
  }

  Future<bool> pair({
    required String serialNo,
    required String make,
    required String model,
    required String plateNo,
  }) async {
    final user = ref.read(authViewModelProvider).user;
    if (user == null) {
      _error = 'Sign in again before pairing.';
      ref.invalidateSelf();
      return false;
    }
    _busy = true;
    _error = null;
    ref.invalidateSelf();
    final result = await ref.read(pairVehicleProvider).call(
      ownerId: user.id,
      serialNo: serialNo,
      make: make,
      model: model,
      plateNo: plateNo,
    );
    _busy = false;
    final ok = result.fold((failure) {
      _error = failure.message;
      return false;
    }, (vehicle) {
      _remoteVehicle = vehicle;
      _error = null;
      return true;
    });
    ref.invalidateSelf();
    return ok;
  }
}

final vehicleViewModelProvider = NotifierProvider<VehicleViewModel, VehicleState>(
  VehicleViewModel.new,
);
