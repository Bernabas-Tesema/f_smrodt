import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/security/biometric_service.dart';
import '../../../../core/security/secure_storage_service.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/repositories/auth_repository.dart';

/// Authentication provider.
final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

final biometricServiceProvider = Provider<BiometricService>(
  (ref) => BiometricService(),
);

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(ref.watch(secureStorageProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    AuthRemoteDataSource(
      ref.watch(apiClientProvider),
      ref.watch(pilotStoreProvider.notifier),
      secure: ref.watch(secureStorageProvider),
    ),
    ref.watch(secureStorageProvider),
    ref.watch(pilotStoreProvider.notifier),
  );
});
