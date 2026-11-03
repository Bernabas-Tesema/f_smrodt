/// Application-wide constants.
class AppConstants {
  const AppConstants._();

  static const appName = 'SMROD';
  static const tagline = 'Edge intelligence for connected vehicle safety.';

  /// Pilot builds talk to the local store until the NestJS gateway is live.
  static const usePilotData = true;

  static const tokenKey = 'access_token';
  static const emailKey = 'session_email';
  static const biometricKey = 'biometric_lock';
  static const voiceKey = 'robotic_voice';
  static const pilotSnapshotKey = 'pilot_snapshot';

  static const demoEmail = 'owner@smrod.app';
  static const demoPassword = 'Smrod1234';
  static const emergencyContact = '+251 911 000 112';

  /// Supabase Cloud Credentials & Project Mapping
  static const supabaseProjectRef = 'tobexeirhbjehfwrojty';
  static const supabaseUrl = 'https://tobexeirhbjehfwrojty.supabase.co';
  static const supabaseRestUrl = 'https://tobexeirhbjehfwrojty.supabase.co/rest/v1';
  static const supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvYmV4ZWlyaGJqZWhmd3JvanR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2OTU2ODcsImV4cCI6MjEwOTI3MTY4N30.SFB7tCCWl8U5NKrJT72cYtCEcSr2usg-QppQ1SMWmQU';

  static const homeLatitude = 9.0300;
  static const homeLongitude = 38.7400;
}

enum AlertSeverity { info, warning, critical }

enum RiskLevel { low, medium, critical }

extension RiskLevelLabel on RiskLevel {
  String get label => switch (this) {
    RiskLevel.low => 'Low',
    RiskLevel.medium => 'Medium',
    RiskLevel.critical => 'Critical',
  };
}
