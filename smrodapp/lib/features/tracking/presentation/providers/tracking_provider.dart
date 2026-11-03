import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../data/datasources/tracking_remote_datasource.dart';
import '../../data/repositories/tracking_repository_impl.dart';
import '../../domain/repositories/tracking_repository.dart';
import '../../domain/usecases/get_live_location.dart';
import '../../domain/usecases/get_location_history.dart';

/// Tracking provider.
final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  return TrackingRepositoryImpl(
    TrackingRemoteDataSource(
      ref.watch(apiClientProvider),
      ref.watch(pilotStoreProvider.notifier),
    ),
  );
});

final getLiveLocationProvider = Provider<GetLiveLocation>(
  (ref) => GetLiveLocation(ref.watch(trackingRepositoryProvider)),
);

final getLocationHistoryProvider = Provider<GetLocationHistory>(
  (ref) => GetLocationHistory(ref.watch(trackingRepositoryProvider)),
);
