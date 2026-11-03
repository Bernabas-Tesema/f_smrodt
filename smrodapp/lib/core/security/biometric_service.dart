import 'package:local_auth/local_auth.dart';

/// Biometric authentication service.
enum BiometricOutcome { success, failed, unavailable }

class BiometricService {
  BiometricService({LocalAuthentication? auth})
    : _auth = auth ?? LocalAuthentication();

  final LocalAuthentication _auth;

  Future<BiometricOutcome> authenticate(String reason) async {
    try {
      final supported = await _auth.isDeviceSupported();
      if (!supported) return BiometricOutcome.unavailable;
      final ok = await _auth.authenticate(
        localizedReason: reason,
        biometricOnly: false,
        persistAcrossBackgrounding: true,
      );
      return ok ? BiometricOutcome.success : BiometricOutcome.failed;
    } catch (_) {
      return BiometricOutcome.unavailable;
    }
  }
}
