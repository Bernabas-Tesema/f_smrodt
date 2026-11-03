import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../../../core/security/secure_storage_service.dart';
import '../models/user_model.dart';
import 'social_sign_in.dart';

/// Remote authentication data source.
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
    final response = await _guard(
      () => _api.post(ApiConstants.login, data: {'email': email, 'password': password}),
    );
    return _userFromAuthResponse(response.data as Map<String, dynamic>);
  }

  Future<UserModel> register({
    required String displayName,
    required String email,
    required String password,
  }) async {
    if (AppConstants.usePilotData) {
      final user = _store.register(
        displayName: displayName,
        email: email,
        password: password,
      );
      return UserModel.fromEntity(user);
    }
    final response = await _guard(
      () => _api.post(
        ApiConstants.register,
        data: {'email': email, 'password': password},
      ),
    );
    return _userFromAuthResponse(response.data as Map<String, dynamic>);
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
    final response = await _guard(
      () => _api.post(
        ApiConstants.login,
        data: {'provider': profile.provider, 'email': profile.email},
      ),
    );
    return _userFromAuthResponse(response.data as Map<String, dynamic>);
  }

  Future<void> forgotPassword({required String email}) async {
    if (AppConstants.usePilotData) {
      if (_store.findByEmail(email) == null) {
        throw const AppException('No account uses that email.');
      }
      return;
    }
    await _guard(
      () => _api.post(ApiConstants.forgotPassword, data: {'email': email}),
    );
  }

  Future<UserModel?> restore() async {
    if (AppConstants.usePilotData) return null;
    try {
      final response = await _api.get(ApiConstants.me);
      final json = response.data as Map<String, dynamic>;
      final email = await _secure.read(AppConstants.emailKey) ?? '';
      return UserModel.fromJson({
        'id': json['userId'],
        'role': json['role'],
        'email': email,
      });
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Session expired');
    }
  }

  Future<UserModel> _userFromAuthResponse(Map<String, dynamic> json) async {
    final user = json['user'] as Map<String, dynamic>;
    final tokens = json['tokens'] as Map<String, dynamic>;
    await _secure.write(AppConstants.tokenKey, tokens['accessToken'] as String);
    await _secure.write(AppConstants.emailKey, user['email'] as String);
    return UserModel.fromJson(user);
  }

  Future<Response<dynamic>> _guard(Future<Response<dynamic>> Function() call) async {
    try {
      return await call();
    } on DioException catch (error) {
      throw AppException(error.message ?? 'Network failure');
    }
  }
}
