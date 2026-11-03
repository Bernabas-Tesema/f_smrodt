/// Authentication user entity.
class User {
  const User({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    required this.mfaEnabled,
  });

  final String id;
  final String email;
  final String displayName;
  final String role;
  final bool mfaEnabled;
}
