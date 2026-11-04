import 'app_constants.dart';

/// API endpoint constants connecting the Flutter mobile app to the Django REST Backend & AI Engine.
class ApiConstants {
  const ApiConstants._();

  /// Django AI / REST base. Override at build time:
  /// `--dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1` (Android emulator)
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8000/api/v1',
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

  // AI Intelligence System (matches Django apps.ai_engine.urls)
  static const aiOverview = '/ai/overview/';
  static const aiTheftDetections = '/ai/theft-detections/';
  static const aiCrashDetections = '/ai/crash-detections/';
  static const aiRiskDistribution = '/ai/risk-distribution/';
  static const aiPerformance = '/ai/performance/';
  static String aiVehicleRisk(String vehicleId) => '/ai/vehicles/$vehicleId/risk/';
  static String aiInvestigate(String eventId) => '/ai/events/$eventId/analyze/';

  // Legacy aliases kept for older call sites
  static const aiTheftDetection = aiTheftDetections;
  static const aiCrashDetection = aiCrashDetections;
  static const aiRiskScore = '/ai/risk-scoring';
  static const aiInsights = '/ai/insights';

  // Notifications, Emergencies & Geofences
  static const notifications = '/notifications';
  static const emergencies = '/emergency/events';
  static const sos = '/emergency/sos';
  static const geofences = '/geofences';
}
