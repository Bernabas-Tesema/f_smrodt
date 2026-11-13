import '../../../../core/errors/failure.dart';
import '../entities/user.dart';

/// Authentication repository contract.
abstract class AuthRepository {
  Future<Result<User>> login({required String email, required String password});

  Future<Result<User>> loginWithProvider(String provider);

  Future<Result<User>> register({
    required String displayName,
    required String email,
    required String password,
  });

  Future<Result<void>> forgotPassword({required String email});

  Future<Result<void>> logout();

  Future<Result<User?>> restore();
}
