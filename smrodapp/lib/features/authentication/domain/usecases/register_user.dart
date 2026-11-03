import '../../../../core/errors/failure.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Register user use case.
class RegisterUser {
  const RegisterUser(this._repository);

  final AuthRepository _repository;

  Future<Result<User>> call({
    required String displayName,
    required String email,
    required String password,
  }) {
    return _repository.register(
      displayName: displayName,
      email: email,
      password: password,
    );
  }
}
