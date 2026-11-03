import '../../domain/entities/user.dart';

/// Authentication user data model.
class UserModel {
  const UserModel({
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

  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
    );
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: (json['displayName'] ?? json['display_name'] ?? '') as String,
      role: (json['role'] ?? 'owner') as String,
      mfaEnabled: (json['mfaEnabled'] ?? json['mfa_enabled'] ?? false) as bool,
    );
  }

  User toEntity() {
    return User(
      id: id,
      email: email,
      displayName: displayName,
      role: role,
      mfaEnabled: mfaEnabled,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'displayName': displayName,
    'role': role,
    'mfaEnabled': mfaEnabled,
  };
}
