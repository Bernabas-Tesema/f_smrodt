import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';

class SocialProfile {
  const SocialProfile({
    required this.provider,
    required this.email,
    required this.displayName,
    this.idToken,
    this.accessToken,
  });

  final String provider;
  final String email;
  final String displayName;
  final String? idToken;
  final String? accessToken;
}

/// Google (v7) and Apple sign-in helpers.
class SocialSignIn {
  bool _googleReady = false;

  Future<void> _ensureGoogleInitialized() async {
    if (_googleReady) return;

    final webClientId = AppConstants.googleWebClientId.trim();
    if (webClientId.isEmpty || webClientId.startsWith('YOUR_WEB_CLIENT_ID')) {
      throw const AppException(
        'Add your Google Web Client ID in app_constants.dart (googleWebClientId).',
      );
    }

    String? platformClientId;
    if (!kIsWeb && Platform.isIOS) {
      final iosId = AppConstants.googleIosClientId.trim();
      platformClientId = iosId.isEmpty ? null : iosId;
    } else if (!kIsWeb && Platform.isAndroid) {
      final androidId = AppConstants.googleAndroidClientId.trim();
      platformClientId = androidId.isEmpty ? null : androidId;
    }

    await GoogleSignIn.instance.initialize(
      serverClientId: webClientId,
      clientId: platformClientId,
    );
    _googleReady = true;
  }

  Future<SocialProfile> google() async {
    try {
      await _ensureGoogleInitialized();

      final googleSignIn = GoogleSignIn.instance;
      final account = await googleSignIn.authenticate(
        scopeHint: const ['email', 'profile'],
      );

      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw const AppException(
          'Google ID token is missing. Check googleWebClientId (Web client ID) and SHA-1.',
        );
      }

      String? accessToken;
      try {
        final authz = await account.authorizationClient.authorizationForScopes(
          const ['email', 'profile'],
        );
        accessToken = authz?.accessToken;
      } catch (_) {
        // Access token is optional for Supabase signInWithIdToken.
      }

      return SocialProfile(
        provider: 'google',
        email: account.email,
        displayName: account.displayName?.trim().isNotEmpty == true
            ? account.displayName!.trim()
            : 'Google Owner',
        idToken: idToken,
        accessToken: accessToken,
      );
    } on AppException {
      rethrow;
    } on GoogleSignInException catch (error) {
      if (error.code == GoogleSignInExceptionCode.canceled) {
        throw const AppException('Google sign-in was cancelled.');
      }
      throw AppException(error.description ?? 'Google sign-in failed.');
    } catch (error) {
      if (AppConstants.usePilotData) {
        return const SocialProfile(
          provider: 'google',
          email: 'google.owner@smrod.app',
          displayName: 'Google Owner',
        );
      }
      throw AppException('Google sign-in failed: $error');
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
        idToken: credential.identityToken,
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
