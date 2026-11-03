import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/failure.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../domain/entities/vehicle_location.dart';
import '../providers/tracking_provider.dart';

class TrackingState {
  const TrackingState({
    this.current,
    this.history = const [],
    this.loading = false,
    this.error,
  });

  final VehicleLocation? current;
  final List<VehicleLocation> history;
  final bool loading;
  final String? error;
}

/// Tracking view model.
class TrackingViewModel extends Notifier<TrackingState> {
  var _busy = false;
  String? _error;

  @override
  TrackingState build() {
    final data = ref.watch(pilotStoreProvider);
    final user = ref.watch(authViewModelProvider).user;
    final vehicle = data.vehicle;
    final owned = user != null && vehicle?.ownerId == user.id;
    final history = owned
        ? data.history.where((item) => item.vehicleId == vehicle!.id).toList()
        : const <VehicleLocation>[];
    return TrackingState(
      current: owned ? data.currentLocation : null,
      history: history,
      loading: _busy,
      error: _error,
    );
  }

  Future<void> refresh() async {
    final user = ref.read(authViewModelProvider).user;
    if (user == null) return;
    _busy = true;
    _error = null;
    ref.invalidateSelf();
    final result = await ref.read(getLocationHistoryProvider).call(user.id);
    _busy = false;
    result.fold((failure) => _error = failure.message, (_) => _error = null);
    ref.invalidateSelf();
  }
}

final trackingViewModelProvider = NotifierProvider<TrackingViewModel, TrackingState>(
  TrackingViewModel.new,
);
