import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../../core/security/secure_storage_service.dart';
import '../models/user_model.dart';
import 'social_sign_in.dart';

/// Remote authentication data source (Supabase Auth + optional pilot store).
class AuthRemoteDataSource {
  AuthRemoteDataSource(this._api, this._store, {required SecureStorageService secure, SocialSignIn? social})
    : _secure = secure,
      _social = social ?? SocialSignIn();

  final ApiClient _api;
  final PilotStore _store;
  final SecureStorageService _secure;
  final SocialSignIn _social;

  Future<UserModel> login({required String email, required String password}) async {
    if (AppConstants.usePilotData) {
      final user = _store.authenticate(email, password);
      if (user == null) {
        throw const AppException('Email or password is incorrect.');
      }
      return UserModel.fromEntity(user);
    }

    final response = await _supabasePost(
      ApiConstants.supabaseSignIn,
      data: {'email': email.trim().toLowerCase(), 'password': password},
    );
    return _userFromSupabaseAuth(response);
  }

  Future<UserModel> register({
    required String displayName,
    required String email,
    required String password,
  }) async {
    final normalized = email.trim().toLowerCase();

    if (AppConstants.usePilotData) {
      if (_store.findByEmail(normalized) != null) {
        throw const AppException('An account with that email already exists.');
      }
      await _sendVerificationEmail(
        email: normalized,
        password: password,
        displayName: displayName,
      );
      final user = _store.register(
        displayName: displayName,
        email: normalized,
        password: password,
      );
      return UserModel.fromEntity(user);
    }

    final response = await _supabasePost(
      ApiConstants.supabaseSignUp,
      data: {
        'email': normalized,
        'password': password,
        'data': {
          'display_name': displayName.trim(),
          'full_name': displayName.trim(),
          'role': 'owner',
        },
      },
    );

    final body = response.data;
    if (body is Map) {
      final user = body['user'];
      if (user is Map && user['identities'] is List && (user['identities'] as List).isEmpty) {
        throw const AppException('An account with that email already exists. Sign in instead.');
      }
      // Email confirmation may be required — try password grant if session present.
      if (body['access_token'] is String) {
        return _userFromSupabaseAuth(response);
      }
    }

    // Account created; sign in immediately when confirmation is disabled.
    try {
      return await login(email: normalized, password: password);
    } on AppException {
      throw const AppException(
        'Account created. Check your email to confirm, then sign in.',
      );
    }
  }

  Future<UserModel> loginWithProvider(String provider) async {
    final profile = provider == 'apple' ? await _social.apple() : await _social.google();
    if (AppConstants.usePilotData) {
      final existing = _store.findByEmail(profile.email);
      if (existing != null) return UserModel.fromEntity(existing);
      final created = _store.register(
        displayName: profile.displayName,
        email: profile.email,
        password: 'smrod-${profile.provider}-session',
      );
      return UserModel.fromEntity(created);
    }

    if (provider == 'google') {
      return _signInWithGoogleIdToken(profile);
    }

    throw AppException(
      'Sign in with ${provider[0].toUpperCase()}${provider.substring(1)} via Supabase is not configured yet. Use Google or email/password.',
    );
  }

  Future<UserModel> _signInWithGoogleIdToken(SocialProfile profile) async {
    final idToken = profile.idToken;
    if (idToken == null || idToken.isEmpty) {
      throw const AppException('Google ID token is missing');
    }

    try {
      final response = await Supabase.instance.client.auth.signInWithIdToken(
        provider: OAuthProvider.google,
        idToken: idToken,
        accessToken: profile.accessToken,
      );

      final session = response.session;
      final user = response.user;
      if (session == null || user == null) {
        throw const AppException('Supabase Google sign-in returned no session.');
      }

      await _secure.write(AppConstants.tokenKey, session.accessToken);
      await _secure.write(AppConstants.emailKey, user.email ?? profile.email);

      final meta = user.userMetadata ?? {};
      return UserModel(
        id: user.id,
        email: user.email ?? profile.email,
        displayName: (meta['full_name'] ?? meta['name'] ?? profile.displayName).toString(),
        role: (meta['role'] ?? 'owner').toString(),
        mfaEnabled: false,
      );
    } on AuthException catch (error) {
      throw AppException(error.message);
    } on AppException {
      rethrow;
    } catch (error) {
      throw AppException('Supabase Google sign-in failed: $error');
    }
  }

  Future<void> forgotPassword({required String email}) async {
    if (AppConstants.usePilotData) {
      if (_store.findByEmail(email) == null) {
        throw const AppException('No account uses that email.');
      }
      return;
    }
    await _supabasePost(
      ApiConstants.supabaseRecover,
      data: {'email': email.trim().toLowerCase()},
    );
  }

  Future<UserModel?> restore() async {
    if (AppConstants.usePilotData) return null;
    final token = await _secure.read(AppConstants.tokenKey);
    final email = await _secure.read(AppConstants.emailKey) ?? '';
    if (token == null || token.isEmpty) return null;

    final dio = _supabaseDio();
    try {
      final response = await dio.get(
        ApiConstants.supabaseUser,
        options: Options(headers: {
          ...ApiConstants.supabaseHeaders,
          'Authorization': 'Bearer $token',
        }),
      );
      if ((response.statusCode ?? 0) >= 400) return null;
      final json = response.data as Map<String, dynamic>;
      final meta = (json['user_metadata'] as Map?)?.cast<String, dynamic>() ?? {};
      return UserModel(
        id: json['id'] as String? ?? '',
        email: json['email'] as String? ?? email,
        displayName: (meta['full_name'] ?? meta['display_name'] ?? email) as String,
        role: (meta['role'] ?? 'owner') as String,
        mfaEnabled: false,
      );
    } on DioException {
      return null;
    } finally {
      dio.close();
    }
  }

  Future<void> _sendVerificationEmail({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final response = await _supabasePost(
      ApiConstants.supabaseSignUp,
      data: {
        'email': email,
        'password': password,
        'data': {
          'display_name': displayName.trim(),
          'full_name': displayName.trim(),
        },
      },
    );
    final body = response.data;
    if (body is Map) {
      final user = body['user'];
      if (user is Map && user['identities'] is List && (user['identities'] as List).isEmpty) {
        throw const AppException('An account with that email already exists. Sign in instead.');
      }
    }
  }

  Future<Response<dynamic>> _supabasePost(String url, {required Map<String, dynamic> data}) async {
    final dio = _supabaseDio();
    try {
      final response = await dio.post(url, data: data);
      final status = response.statusCode ?? 0;
      if (status >= 400) {
        throw AppException(_supabaseMessage(response.data));
      }
      return response;
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Could not reach Supabase Auth.');
    } finally {
      dio.close();
    }
  }

  Dio _supabaseDio() {
    return Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 12),
        receiveTimeout: const Duration(seconds: 12),
        headers: ApiConstants.supabaseHeaders,
        validateStatus: (code) => code != null && code < 500,
      ),
    );
  }

  Future<UserModel> _userFromSupabaseAuth(Response<dynamic> response) async {
    final body = response.data;
    if (body is! Map) {
      throw const AppException('Unexpected Supabase Auth response.');
    }

    final accessToken = body['access_token'] as String?;
    if (accessToken == null || accessToken.isEmpty) {
      throw AppException(_supabaseMessage(body));
    }

    final user = (body['user'] as Map?)?.cast<String, dynamic>() ?? {};
    final meta = (user['user_metadata'] as Map?)?.cast<String, dynamic>() ?? {};
    final email = user['email'] as String? ?? '';

    await _secure.write(AppConstants.tokenKey, accessToken);
    await _secure.write(AppConstants.emailKey, email);

    return UserModel(
      id: user['id'] as String? ?? '',
      email: email,
      displayName: (meta['full_name'] ?? meta['display_name'] ?? email) as String,
      role: (meta['role'] ?? 'owner') as String,
      mfaEnabled: false,
    );
  }

  String _supabaseMessage(Object? data) {
    if (data is Map) {
      final message = data['msg'] ?? data['message'] ?? data['error_description'] ?? data['error'];
      if (message is String && message.isNotEmpty) {
        if (message.toLowerCase().contains('already')) {
          return 'An account with that email already exists. Sign in instead.';
        }
        if (message.toLowerCase().contains('invalid login')) {
          return 'Email or password is incorrect.';
        }
        return message;
      }
    }
    return 'Authentication failed. Check email/password and try again.';
  }
}
