import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../data/datasources/vehicle_remote_datasource.dart';
import '../../data/repositories/vehicle_repository_impl.dart';
import '../../domain/repositories/vehicle_repository.dart';
import '../../domain/usecases/get_vehicle.dart';
import '../../domain/usecases/pair_vehicle.dart';

/// Vehicle provider.
final vehicleRepositoryProvider = Provider<VehicleRepository>((ref) {
  return VehicleRepositoryImpl(
    VehicleRemoteDataSource(
      ref.watch(apiClientProvider),
      ref.watch(pilotStoreProvider.notifier),
    ),
    ref.watch(pilotStoreProvider.notifier),
  );
});

final getVehicleProvider = Provider<GetVehicle>(
  (ref) => GetVehicle(ref.watch(vehicleRepositoryProvider)),
);

final pairVehicleProvider = Provider<PairVehicle>(
  (ref) => PairVehicle(ref.watch(vehicleRepositoryProvider)),
);
