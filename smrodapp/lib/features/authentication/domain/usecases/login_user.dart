import '../../../../core/errors/failure.dart';
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

/// Login user use case.
class LoginUser {
  const LoginUser(this._repository);

  final AuthRepository _repository;

  Future<Result<User>> call({required String email, required String password}) {
    return _repository.login(email: email, password: password);
  }
}
