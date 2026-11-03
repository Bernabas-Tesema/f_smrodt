import '../../../../core/constants/app_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/errors/failure.dart';
import '../../../../core/security/secure_storage_service.dart';
import '../../../../core/storage/pilot_store.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

/// Authentication repository implementation.
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._secure, this._store);

  final AuthRemoteDataSource _remote;
  final SecureStorageService _secure;
  final PilotStore _store;

  @override
  Future<Result<User>> login({required String email, required String password}) async {
    try {
      final model = await _remote.login(email: email, password: password);
      final user = model.toEntity();
      await _persist(user);
      _store.prepareSession(user);
      return Success(user);
    } on AppException catch (error) {
      return ErrorResult(AuthFailure(error.message));
    }
  }

  @override
  Future<Result<User>> register({
    required String displayName,
    required String email,
    required String password,
  }) async {
    try {
      final model = await _remote.register(
        displayName: displayName,
        email: email,
        password: password,
      );
      final user = model.toEntity();
      await _persist(user);
      return Success(user);
    } on AppException catch (error) {
      return ErrorResult(AuthFailure(error.message));
    }
  }

  @override
  Future<Result<User>> loginWithProvider(String provider) async {
    try {
      final model = await _remote.loginWithProvider(provider);
      final user = model.toEntity();
      await _persist(user);
      _store.prepareSession(user, seedIfEmpty: true);
      return Success(user);
    } on AppException catch (error) {
      return ErrorResult(AuthFailure(error.message));
    }
  }

  @override
  Future<Result<void>> forgotPassword({required String email}) async {
    try {
      await _remote.forgotPassword(email: email);
      return const Success(null);
    } on AppException catch (error) {
      return ErrorResult(AuthFailure(error.message));
    }
  }

  @override
  Future<Result<void>> logout() async {
    await _secure.delete(AppConstants.tokenKey);
    await _secure.delete(AppConstants.emailKey);
    return const Success(null);
  }

  @override
  Future<Result<User?>> restore() async {
    final token = await _secure.read(AppConstants.tokenKey);
    final email = await _secure.read(AppConstants.emailKey);
    if (token == null || email == null) return const Success(null);
    if (!AppConstants.usePilotData) {
      try {
        final model = await _remote.restore();
        return Success(model?.toEntity());
      } on AppException {
        return const Success(null);
      }
    }
    final user = _store.findByEmail(email);
    if (user == null) return const Success(null);
    _store.prepareSession(user);
    return Success(user);
  }

  Future<void> _persist(User user) async {
    if (AppConstants.usePilotData) {
      await _secure.write(AppConstants.tokenKey, 'pilot-${user.id}');
    }
    await _secure.write(AppConstants.emailKey, user.email);
  }
}
