import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/storage/pilot_store.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../data/datasources/security_remote_datasource.dart';
import '../../data/repositories/security_repository_impl.dart';
import '../../domain/repositories/security_repository.dart';
import '../../domain/usecases/get_security_events.dart';
import '../../domain/usecases/send_vehicle_command.dart';

/// Security provider.
final securityRepositoryProvider = Provider<SecurityRepository>((ref) {
  return SecurityRepositoryImpl(
    SecurityRemoteDataSource(
      ref.watch(apiClientProvider),
      ref.watch(pilotStoreProvider.notifier),
    ),
  );
});

final getSecurityEventsProvider = Provider<GetSecurityEvents>(
  (ref) => GetSecurityEvents(ref.watch(securityRepositoryProvider)),
);

final sendVehicleCommandProvider = Provider<SendVehicleCommand>(
  (ref) => SendVehicleCommand(ref.watch(securityRepositoryProvider)),
);
