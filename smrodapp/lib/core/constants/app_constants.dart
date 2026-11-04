/// Application-wide constants.
class AppConstants {
  const AppConstants._();

  static const appName = 'SMROD';
  static const tagline = 'Edge intelligence for connected vehicle safety.';

  /// When false, auth goes to Supabase Auth (password grant / signup).
  static const usePilotData = false;

  static const tokenKey = 'access_token';
  static const emailKey = 'session_email';
  static const biometricKey = 'biometric_lock';
  static const voiceKey = 'robotic_voice';
  static const pilotSnapshotKey = 'pilot_snapshot';

  static const demoEmail = 'owner@smrod.app';
  static const demoPassword = 'Smrod1234';
  static const emergencyContact = '+251 911 000 112';
  static const supportPhone = '+251911000112';
  static const supportEmail = 'support@smrod.ai';
  static const supportWhatsApp = '+251911000112';
  static const supportHours = 'Mon–Sat · 8:00–20:00 EAT';

  /// Supabase Cloud Credentials & Project Mapping
  static const supabaseProjectRef = 'tobexeirhbjehfwrojty';
  static const supabaseUrl = 'https://tobexeirhbjehfwrojty.supabase.co';
  static const supabaseRestUrl = 'https://tobexeirhbjehfwrojty.supabase.co/rest/v1';
  static const supabaseAnonKey =
      'sb_publishable_WsbwClnOVSev3LYo3AgVgA_qsdPvo4b';

  /// Google OAuth — paste IDs from Google Cloud Console → APIs & Services → Credentials
  /// REQUIRED: Web application client ID (used as serverClientId for Android ID tokens)
  static const googleWebClientId =
      '282352212036-7tn5i0so9n9ddb8qqjranafpn3cigl84.apps.googleusercontent.com';

  /// OPTIONAL: Android OAuth client ID (usually leave empty if package + SHA-1 are set)
  static const googleAndroidClientId = '282352212036-lto40vc6q5ncq0g6q7vv26talhd67p4k.apps.googleusercontent.com';

  /// OPTIONAL: iOS OAuth client ID (needed for iOS builds)
  static const googleIosClientId = '282352212036-eqogpapfvgbklov0u0t5331jc6o2lg0v.apps.googleusercontent.com';

  /// NEVER put Google Client Secret in the Flutter app.
  /// Put Client Secret only in Supabase → Authentication → Providers → Google.

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
