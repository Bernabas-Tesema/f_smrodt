import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';

class SocialProfile {
  const SocialProfile({
    required this.provider,
    required this.email,
    required this.displayName,
  });

  final String provider;
  final String email;
  final String displayName;
}

/// Google and Apple sign-in. The pilot build still opens an owner session
/// when the store accounts are not configured on the device.
class SocialSignIn {
  Future<SocialProfile> google() async {
    try {
      final account = await GoogleSignIn(scopes: const ['email']).signIn();
      if (account == null) {
        throw const AppException('Google sign-in was cancelled.');
      }
      return SocialProfile(
        provider: 'google',
        email: account.email,
        displayName: account.displayName?.trim().isNotEmpty == true
            ? account.displayName!.trim()
            : 'Google Owner',
      );
    } on AppException {
      rethrow;
    } catch (_) {
      if (AppConstants.usePilotData) {
        return const SocialProfile(
          provider: 'google',
          email: 'google.owner@smrod.app',
          displayName: 'Google Owner',
        );
      }
      throw const AppException('Google sign-in is not available on this device.');
    }
  }

  Future<SocialProfile> apple() async {
    try {
      final available = await SignInWithApple.isAvailable();
      if (!available) {
        return _appleFallback('Apple sign-in is not available on this device.');
      }
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );
      final given = credential.givenName ?? '';
      final family = credential.familyName ?? '';
      final name = '$given $family'.trim();
      return SocialProfile(
        provider: 'apple',
        email: credential.email ?? 'apple.owner@smrod.app',
        displayName: name.isEmpty ? 'Apple Owner' : name,
      );
    } on SignInWithAppleAuthorizationException catch (error) {
      if (error.code == AuthorizationErrorCode.canceled) {
        throw const AppException('Apple sign-in was cancelled.');
      }
      return _appleFallback(error.message);
    } on AppException {
      rethrow;
    } catch (_) {
      return _appleFallback('Apple sign-in is not available on this device.');
    }
  }

  SocialProfile _appleFallback(String message) {
    if (AppConstants.usePilotData) {
      return const SocialProfile(
        provider: 'apple',
        email: 'apple.owner@smrod.app',
        displayName: 'Apple Owner',
      );
    }
    throw AppException(message);
  }
}
