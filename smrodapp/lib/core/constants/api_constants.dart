import 'app_constants.dart';

/// API endpoint constants connecting the Flutter mobile app to the Django REST Backend & AI Engine.
class ApiConstants {
  const ApiConstants._();

  /// Configurable backend URL with production fallback to Django REST Core.
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.smrod.ai/api/v1',
  );

  // Supabase REST & Auth Direct Endpoints (Project: tobexeirhbjehfwrojty)
  static const supabaseRestBase = '${AppConstants.supabaseUrl}/rest/v1';
  static const supabaseAuthBase = '${AppConstants.supabaseUrl}/auth/v1';
  static const supabaseSignUp = '$supabaseAuthBase/signup';
  static const supabaseSignIn = '$supabaseAuthBase/token?grant_type=password';
  static const supabaseUser = '$supabaseAuthBase/user';
  static const supabaseRecover = '$supabaseAuthBase/recover';
  static const supabaseLogout = '$supabaseAuthBase/logout';

  static Map<String, String> get supabaseHeaders => {
    'apikey': AppConstants.supabaseAnonKey,
    'Authorization': 'Bearer ${AppConstants.supabaseAnonKey}',
    'Content-Type': 'application/json',
  };

  // Authentication & Identity (Django RBAC & Supabase JWT verification)
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const me = '/auth/me';
  static const forgotPassword = '/auth/forgot-password';
  static const socialAuth = '/auth/social';

  // Vehicles & Live Telemetry
  static const vehicle = '/vehicles/current';
  static const pair = '/vehicles/pair';
  static const location = '/vehicles/current/location';
  static const locationHistory = '/vehicles/current/location/history';
  static const commands = '/vehicles/current/commands';
  static const securityEvents = '/vehicles/current/security/events';

  // AI Intelligence System & Threat Engines
  static const aiOverview = '/ai/overview';
  static const aiTheftDetection = '/ai/theft-detection';
  static const aiCrashDetection = '/ai/crash-detection';
  static const aiRiskScore = '/ai/risk-scoring';
  static const aiInsights = '/ai/insights';
  static const aiInvestigate = '/ai/investigate';

  // Notifications, Emergencies & Geofences
  static const notifications = '/notifications';
  static const emergencies = '/emergency/events';
  static const sos = '/emergency/sos';
  static const geofences = '/geofences';
}
