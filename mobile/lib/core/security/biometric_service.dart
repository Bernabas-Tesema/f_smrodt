import 'package:local_auth/local_auth.dart';

/// Biometric authentication service.
enum BiometricOutcome { success, failed, unavailable }

class BiometricCapability {
  const BiometricCapability({
    required this.available,
    required this.types,
  });

  final bool available;
  final List<BiometricType> types;

  String get label {
    if (!available) return 'This phone has no fingerprint or face unlock.';
    final hasFingerprint = types.contains(BiometricType.fingerprint) ||
        types.contains(BiometricType.strong) ||
        types.contains(BiometricType.weak);
    final hasFace = types.contains(BiometricType.face);
    if (hasFingerprint && hasFace) {
      return 'Fingerprint and face unlock are ready on this phone.';
    }
    if (hasFace) return 'Face unlock is ready on this phone.';
    return 'Fingerprint unlock is ready on this phone.';
  }
}

class BiometricService {
  BiometricService({LocalAuthentication? auth})
    : _auth = auth ?? LocalAuthentication();

  final LocalAuthentication _auth;

  Future<BiometricCapability> detectCapability() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final supported = await _auth.isDeviceSupported();
      final types = await _auth.getAvailableBiometrics();
      final enrolled = types.isNotEmpty;
      return BiometricCapability(
        available: supported && (canCheck || enrolled),
        types: types,
      );
    } catch (_) {
      return const BiometricCapability(available: false, types: []);
    }
  }

  Future<BiometricOutcome> authenticate(String reason) async {
    try {
      final capability = await detectCapability();
      if (!capability.available) return BiometricOutcome.unavailable;
      final ok = await _auth.authenticate(
        localizedReason: reason,
        biometricOnly: true,
        persistAcrossBackgrounding: true,
      );
      return ok ? BiometricOutcome.success : BiometricOutcome.failed;
    } catch (_) {
      return BiometricOutcome.unavailable;
    }
  }
}
