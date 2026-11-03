import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/alerts/voice_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/security/biometric_service.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login_user.dart';
import '../../domain/usecases/logout_user.dart';
import '../../domain/usecases/register_user.dart';
import '../providers/auth_provider.dart';

class AuthState {
  const AuthState({
    this.user,
    this.loading = false,
    this.restoring = false,
    this.biometricEnabled = false,
    this.canUnlockWithBiometric = false,
    this.error,
  });

  final User? user;
  final bool loading;
  final bool restoring;
  final bool biometricEnabled;
  final bool canUnlockWithBiometric;
  final String? error;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    User? user,
    bool clearUser = false,
    bool? loading,
    bool? restoring,
    bool? biometricEnabled,
    bool? canUnlockWithBiometric,
    String? error,
    bool clearError = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
      restoring: restoring ?? this.restoring,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      canUnlockWithBiometric:
          canUnlockWithBiometric ?? this.canUnlockWithBiometric,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Authentication view model.
class AuthViewModel extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  Future<void> restoreSession() async {
    if (state.isAuthenticated) return;
    try {
      final secure = ref.read(secureStorageProvider);
      final biometricOn = await secure.read(AppConstants.biometricKey) == '1';
      final restored = await ref.read(authRepositoryProvider).restore();
      if (state.isAuthenticated) return;
      final user = restored.fold((_) => null, (value) => value);
      if (biometricOn && user != null) {
        state = AuthState(
          restoring: false,
          biometricEnabled: true,
          canUnlockWithBiometric: true,
        );
        return;
      }
      state = AuthState(
        user: user,
        restoring: false,
        biometricEnabled: biometricOn,
      );
    } catch (_) {
      state = const AuthState(restoring: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(loading: true, clearError: true);
    final result = await ref
        .read(loginUserProvider)
        .call(email: email, password: password);
    return result.fold(
      (failure) {
        state = state.copyWith(loading: false, error: failure.message);
        return false;
      },
      (user) {
        state = state.copyWith(user: user, loading: false, clearError: true);
        return true;
      },
    );
  }

  Future<bool> loginWithProvider(String provider) async {
    state = state.copyWith(loading: true, clearError: true);
    final result = await ref
        .read(authRepositoryProvider)
        .loginWithProvider(provider);
    return result.fold(
      (failure) {
        state = state.copyWith(loading: false, error: failure.message);
        return false;
      },
      (user) {
        state = state.copyWith(user: user, loading: false, clearError: true);
        return true;
      },
    );
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    final result = await ref
        .read(registerUserProvider)
        .call(displayName: name, email: email, password: password);
    return result.fold(
      (failure) {
        state = state.copyWith(loading: false, error: failure.message);
        return false;
      },
      (user) {
        state = state.copyWith(user: user, loading: false, clearError: true);
        return true;
      },
    );
  }

  Future<String?> forgotPassword(String email) async {
    state = state.copyWith(loading: true, clearError: true);
    final result = await ref
        .read(authRepositoryProvider)
        .forgotPassword(email: email);
    return result.fold(
      (failure) {
        state = state.copyWith(loading: false, error: failure.message);
        return failure.message;
      },
      (_) {
        state = state.copyWith(loading: false, clearError: true);
        return null;
      },
    );
  }

  Future<bool> unlockWithBiometric() async {
    final outcome = await ref
        .read(biometricServiceProvider)
        .authenticate('Unlock ${AppConstants.appName}');
    if (outcome != BiometricOutcome.success) {
      state = state.copyWith(
        error: outcome == BiometricOutcome.unavailable
            ? 'Biometrics are not available on this device.'
            : 'Unlock cancelled.',
      );
      return false;
    }
    final restored = await ref.read(authRepositoryProvider).restore();
    final unlocked = restored.fold(
      (failure) {
        state = state.copyWith(error: failure.message);
        return false;
      },
      (user) {
        state = state.copyWith(
          user: user,
          clearError: true,
          canUnlockWithBiometric: true,
        );
        return true;
      },
    );
    if (unlocked) {
      await VoiceService.instance.speak(
        'Access granted. Welcome to ${AppConstants.appName}.',
      );
    }
    return unlocked;
  }

  /// Restores a saved session from the fingerprint screen without the device sensor.
  Future<bool> continuePastBiometric() async {
    if (state.isAuthenticated) return true;
    if (!state.canUnlockWithBiometric) return false;
    final restored = await ref.read(authRepositoryProvider).restore();
    return restored.fold(
      (failure) {
        state = state.copyWith(error: failure.message);
        return false;
      },
      (user) {
        if (user == null) return false;
        state = state.copyWith(user: user, clearError: true);
        return true;
      },
    );
  }

  Future<void> setBiometric(bool enabled) async {
    final secure = ref.read(secureStorageProvider);
    if (!enabled) {
      await secure.write(AppConstants.biometricKey, '0');
      state = state.copyWith(biometricEnabled: false, clearError: true);
      return;
    }
    final outcome = await ref
        .read(biometricServiceProvider)
        .authenticate('Enable the ${AppConstants.appName} app lock');
    if (outcome == BiometricOutcome.failed) {
      state = state.copyWith(error: 'App lock was not enabled.');
      return;
    }
    await secure.write(AppConstants.biometricKey, '1');
    state = state.copyWith(biometricEnabled: true, clearError: true);
    await VoiceService.instance.speak('Your biometric lock is on.');
  }

  Future<void> logout() async {
    await ref.read(logoutUserProvider).call();
    state = AuthState(
      restoring: false,
      biometricEnabled: state.biometricEnabled,
    );
  }
}

/// Exposed so the repository provider file can stay the wiring point.
final loginUserProvider = Provider<LoginUser>(
  (ref) => LoginUser(ref.watch(authRepositoryProvider)),
);

final registerUserProvider = Provider<RegisterUser>(
  (ref) => RegisterUser(ref.watch(authRepositoryProvider)),
);

final logoutUserProvider = Provider<LogoutUser>(
  (ref) => LogoutUser(ref.watch(authRepositoryProvider)),
);

final authViewModelProvider = NotifierProvider<AuthViewModel, AuthState>(
  AuthViewModel.new,
);
