import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/authentication/presentation/screens/forgot_password_screen.dart';
import '../../features/authentication/presentation/screens/biometric_gate_screen.dart';
import '../../features/authentication/presentation/screens/login_screen.dart';
import '../../features/authentication/presentation/screens/register_screen.dart';
import '../../features/authentication/presentation/screens/profile_screen.dart';
import '../../features/authentication/presentation/screens/welcome_screen.dart';
import '../../features/authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../features/emergency/presentation/screens/emergency_screen.dart';
import '../../features/geofence/presentation/screens/geofence_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/security/presentation/screens/remote_control_screen.dart';
import '../../features/security/presentation/screens/security_screen.dart';
import '../../features/tracking/presentation/screens/tracking_screen.dart';
import '../../features/vehicle/presentation/screens/vehicle_dashboard_screen.dart';
import '../../features/vehicle/presentation/screens/vehicle_details_screen.dart';
import '../../features/vehicle/presentation/screens/vehicle_pairing_screen.dart';
import '../../shared/widgets/app_scaffold.dart';
import '../../features/vehicle/presentation/viewmodels/vehicle_viewmodel.dart';

/// Application route configuration.
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref.onDispose(refresh.dispose);
  ref.listen(authViewModelProvider, (_, _) => refresh.value++);

  return GoRouter(
    initialLocation: _start(ref),
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authViewModelProvider);
      final loggedIn = auth.isAuthenticated;
      final location = state.matchedLocation;
      final onAuthPage =
          location == '/welcome' ||
          location == '/login' ||
          location == '/register' ||
          location == '/forgot-password';
      final onBiometric = location == '/biometric';
      final hasVehicle = _hasVehicle(ref, auth.user?.id);
      if (!loggedIn && !onAuthPage && !onBiometric) return '/welcome';
      if (loggedIn && onAuthPage) return hasVehicle ? '/dashboard' : '/pair';
      if (loggedIn && !hasVehicle && location != '/pair') return '/pair';
      if (loggedIn && hasVehicle && location == '/pair') return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/biometric',
        builder: (context, state) => const BiometricGateScreen(),
      ),
      GoRoute(
        path: '/pair',
        builder: (context, state) => const VehiclePairingScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            AppScaffold(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                builder: (context, state) => const VehicleDashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/track',
                builder: (context, state) => const TrackingScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/security',
                builder: (context, state) => const SecurityScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/alerts',
                builder: (context, state) => const NotificationsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/vehicle',
        builder: (context, state) => const VehicleDetailsScreen(),
      ),
      GoRoute(
        path: '/control',
        builder: (context, state) => const RemoteControlScreen(),
      ),
      GoRoute(
        path: '/emergency',
        builder: (context, state) => const EmergencyScreen(),
      ),
      GoRoute(
        path: '/geofence',
        builder: (context, state) => const GeofenceScreen(),
      ),
    ],
  );
});

String _start(Ref ref) {
  final auth = ref.read(authViewModelProvider);
  if (auth.canUnlockWithBiometric) return '/biometric';
  if (!auth.isAuthenticated) return '/welcome';
  return _hasVehicle(ref, auth.user?.id) ? '/dashboard' : '/pair';
}

bool _hasVehicle(Ref ref, String? ownerId) {
  if (ownerId == null) return false;
  return ref.read(vehicleViewModelProvider).vehicle?.ownerId == ownerId;
}
