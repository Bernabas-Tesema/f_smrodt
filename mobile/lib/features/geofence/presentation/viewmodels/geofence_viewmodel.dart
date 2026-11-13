import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../domain/entities/geofence.dart';
import '../../data/models/geofence_model.dart';

class GeofenceState {
  const GeofenceState({this.zones = const [], this.error});

  final List<Geofence> zones;
  final String? error;
}

/// Geofence view model.
class GeofenceViewModel extends Notifier<GeofenceState> {
  String? _error;
  List<Geofence> _remoteZones = const [];
  String? _loadedOwnerId;

  @override
  GeofenceState build() {
    final data = ref.watch(pilotStoreProvider);
    final user = ref.watch(authViewModelProvider).user;
    final vehicle = data.vehicle;
    final owned = user != null && vehicle?.ownerId == user.id;
    final zones = AppConstants.usePilotData
      ? owned
        ? data.geofences.where((zone) => zone.vehicleId == vehicle!.id).toList()
        : const <Geofence>[]
      : const <Geofence>[];
    if (!AppConstants.usePilotData && user != null && _loadedOwnerId != user.id) {
      _loadedOwnerId = user.id;
      Future.microtask(() async {
        try {
          final response = await ref.read(apiClientProvider).get(ApiConstants.geofences);
          _remoteZones = (response.data as List<dynamic>)
              .map((item) => GeofenceModel.fromJson(item as Map<String, dynamic>).toEntity())
              .toList();
          ref.invalidateSelf();
        } on Exception catch (error) {
          _error = error.toString();
        }
      });
    }
    final visibleZones = AppConstants.usePilotData ? zones : _remoteZones;
    return GeofenceState(zones: visibleZones, error: _error);
  }

  Future<bool> add({required String name, required double radiusMeters}) async {
    try {
      if (AppConstants.usePilotData) {
        ref.read(pilotStoreProvider.notifier).addGeofence(name: name, radiusMeters: radiusMeters);
      } else {
        final response = await ref.read(apiClientProvider).post(
          ApiConstants.geofences,
          data: {'name': name, 'radiusMeters': radiusMeters},
        );
        _remoteZones = [
          GeofenceModel.fromJson(response.data as Map<String, dynamic>).toEntity(),
          ..._remoteZones,
        ];
      }
      _error = null;
      ref.invalidateSelf();
      return true;
    } on Exception catch (error) {
      _error = error.toString();
      ref.invalidateSelf();
      return false;
    }
  }

  Future<void> toggle(String id) async {
    if (AppConstants.usePilotData) {
      ref.read(pilotStoreProvider.notifier).toggleGeofence(id);
      return;
    }
    try {
      final response = await ref.read(apiClientProvider).patch('${ApiConstants.geofences}/$id/toggle');
      final updated = GeofenceModel.fromJson(response.data as Map<String, dynamic>).toEntity();
      _remoteZones = _remoteZones.map((zone) => zone.id == id ? updated : zone).toList();
      ref.invalidateSelf();
    } on Exception catch (error) {
      _error = error.toString();
      ref.invalidateSelf();
    }
  }
}

final geofenceViewModelProvider = NotifierProvider<GeofenceViewModel, GeofenceState>(
  GeofenceViewModel.new,
);
