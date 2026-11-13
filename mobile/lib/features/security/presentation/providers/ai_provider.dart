import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../data/datasources/ai_remote_datasource.dart';
import '../../../vehicle/presentation/viewmodels/vehicle_viewmodel.dart';

final aiRemoteDataSourceProvider = Provider<AiRemoteDataSource>(
  (ref) => AiRemoteDataSource(ref.watch(apiClientProvider)),
);

/// Live AI overview from Django. Falls back to vehicle risk when offline.
final aiOverviewProvider = FutureProvider.autoDispose<AiOverviewSnapshot>((ref) async {
  final vehicle = ref.watch(vehicleViewModelProvider).vehicle;
  final fallbackRisk = vehicle?.riskScore ?? 18;
  return ref.watch(aiRemoteDataSourceProvider).getAiOverview(fallbackRisk: fallbackRisk);
});
