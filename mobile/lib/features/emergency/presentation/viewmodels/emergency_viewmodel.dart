import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/app_exception.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../domain/entities/emergency_event.dart';
import '../../data/models/emergency_event_model.dart';

class EmergencyState {
  const EmergencyState({this.events = const [], this.busy = false, this.error});

  final List<EmergencyEvent> events;
  final bool busy;
  final String? error;
}

/// Emergency view model.
class EmergencyViewModel extends Notifier<EmergencyState> {
  var _busy = false;
  String? _error;

  @override
  EmergencyState build() {
    final data = ref.watch(pilotStoreProvider);
    final user = ref.watch(authViewModelProvider).user;
    final vehicle = data.vehicle;
    final owned = user != null && vehicle?.ownerId == user.id;
    final events = owned
        ? data.emergencyEvents.where((event) => event.vehicleId == vehicle!.id).toList()
        : const <EmergencyEvent>[];
    return EmergencyState(events: events, busy: _busy, error: _error);
  }

  Future<bool> sendSos() async {
    _busy = true;
    _error = null;
    ref.invalidateSelf();
    try {
      if (AppConstants.usePilotData) {
        ref.read(pilotStoreProvider.notifier).triggerSos();
      } else {
        final response = await ref.read(apiClientProvider).post(ApiConstants.sos);
        final event = EmergencyEventModel.fromJson(response.data as Map<String, dynamic>).toEntity();
        state = EmergencyState(events: [event, ...state.events]);
      }
      _busy = false;
      ref.invalidateSelf();
      return true;
    } on AppException catch (error) {
      _busy = false;
      _error = error.message;
      ref.invalidateSelf();
      return false;
    }
  }

  void simulateCrash() {
    ref.read(pilotStoreProvider.notifier).simulateCrash();
  }
}

final emergencyViewModelProvider = NotifierProvider<EmergencyViewModel, EmergencyState>(
  EmergencyViewModel.new,
);
