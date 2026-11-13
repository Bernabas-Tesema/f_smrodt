import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/errors/failure.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../../vehicle/domain/entities/vehicle.dart';
import '../../domain/entities/security_event.dart';
import '../providers/security_provider.dart';

class SecurityState {
  const SecurityState({
    this.vehicle,
    this.events = const [],
    this.commands = const [],
    this.busy = false,
    this.error,
  });

  final Vehicle? vehicle;
  final List<SecurityEvent> events;
  final List<VehicleCommand> commands;
  final bool busy;
  final String? error;

  VehicleCommand? get latestCommand => commands.isEmpty ? null : commands.first;
}

/// Security view model.
class SecurityViewModel extends Notifier<SecurityState> {
  var _busy = false;
  String? _error;

  @override
  SecurityState build() {
    final data = ref.watch(pilotStoreProvider);
    final user = ref.watch(authViewModelProvider).user;
    final vehicle = data.vehicle;
    final owned = user != null && vehicle?.ownerId == user.id ? vehicle : null;
    final events = owned == null
        ? const <SecurityEvent>[]
        : data.securityEvents.where((event) => event.vehicleId == owned.id).toList();
    final commands = owned == null
        ? const <VehicleCommand>[]
        : data.commands.where((command) => command.vehicleId == owned.id).toList();
    return SecurityState(
      vehicle: owned,
      events: events,
      commands: commands,
      busy: _busy,
      error: _error,
    );
  }

  Future<bool> send(VehicleCommandType type) async {
    final user = ref.read(authViewModelProvider).user;
    if (user == null) {
      _error = 'Sign in again before sending a command.';
      ref.invalidateSelf();
      return false;
    }
    _busy = true;
    _error = null;
    ref.invalidateSelf();
    final result = await ref.read(sendVehicleCommandProvider).call(
      type: type,
      userId: user.id,
      idempotencyKey: '${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1 << 30)}',
    );
    _busy = false;
    final ok = result.fold((failure) {
      _error = failure.message;
      return false;
    }, (_) {
      _error = null;
      return true;
    });
    ref.invalidateSelf();
    return ok;
  }

  void simulateTheft() {
    ref.read(pilotStoreProvider.notifier).simulateTheft();
  }
}

final securityViewModelProvider = NotifierProvider<SecurityViewModel, SecurityState>(
  SecurityViewModel.new,
);
