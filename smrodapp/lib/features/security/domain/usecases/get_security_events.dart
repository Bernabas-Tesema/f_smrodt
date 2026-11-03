import '../../../../core/errors/failure.dart';
import '../entities/security_event.dart';
import '../repositories/security_repository.dart';

/// Get security events use case.
class GetSecurityEvents {
  const GetSecurityEvents(this._repository);

  final SecurityRepository _repository;

  Future<Result<List<SecurityEvent>>> call(String ownerId) => _repository.events(ownerId);
}
