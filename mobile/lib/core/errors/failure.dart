/// Application failure types.
sealed class Failure {
  const Failure(this.message);

  final String message;
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class CommandFailure extends Failure {
  const CommandFailure(super.message);
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  const Success(this.value);

  final T value;
}

class ErrorResult<T> extends Result<T> {
  const ErrorResult(this.failure);

  final Failure failure;
}

extension ResultX<T> on Result<T> {
  R fold<R>(
    R Function(Failure failure) onError,
    R Function(T value) onSuccess,
  ) {
    final self = this;
    if (self is Success<T>) return onSuccess(self.value);
    return onError((self as ErrorResult<T>).failure);
  }
}
