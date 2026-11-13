import '../../../../core/errors/failure.dart';
import '../repositories/auth_repository.dart';

/// Logout user use case.
class LogoutUser {
  const LogoutUser(this._repository);

  final AuthRepository _repository;

  Future<Result<void>> call() => _repository.logout();
}
