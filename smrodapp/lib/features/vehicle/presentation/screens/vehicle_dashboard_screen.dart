import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/alerts/voice_service.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../../security/presentation/widgets/security_status_card.dart';
import '../../../../shared/widgets/asset_glyph.dart';
import '../../domain/entities/vehicle.dart';
import '../viewmodels/vehicle_viewmodel.dart';

/// Vehicle dashboard screen.
class VehicleDashboardScreen extends ConsumerWidget {
  const VehicleDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(vehicleViewModelProvider);
    final user = ref.watch(authViewModelProvider).user;
    final vehicle = state.vehicle;

    if (vehicle == null) {
      return const Scaffold(
        backgroundColor: Colors.transparent,
        body: AppLoader(message: 'Loading vehicle status...'),
      );
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          children: [
            _WelcomeCard(
              name: user?.displayName ?? 'Owner',
              onAlerts: () => context.go('/alerts'),
              onAccount: () => _account(context),
            ),
            const SizedBox(height: 14),
            _VehicleHeroCard(vehicle: vehicle),
            const SizedBox(height: 14),
            SecurityStatusCard(vehicle: vehicle),
            const SizedBox(height: 14),
            _AiIntelligenceCard(vehicle: vehicle),
            const SizedBox(height: 18),
            Row(
              children: [
                const Expanded(child: Text('Quick actions', style: AppTextStyles.title)),
                TextButton(onPressed: () => context.go('/security'), child: const Text('View all')),
              ],
            ),
            const _QuickActions(),
            const SizedBox(height: 16),
            const _SosCard(),
          ],
        ),
      ),
    );
  }

  void _account(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return Consumer(
          builder: (context, ref, _) {
            final auth = ref.watch(authViewModelProvider);
            return Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(auth.user?.displayName ?? '', style: AppTextStyles.title),
                  Text(auth.user?.email ?? '', style: AppTextStyles.caption),
                  const SizedBox(height: 8),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    secondary: const _FingerprintBadge(size: 42),
                    title: const Text('Biometric app lock'),
                    subtitle: Text(auth.error ?? 'Ask for biometrics the next time the app opens.'),
                    value: auth.biometricEnabled,
                    activeThumbColor: AppColors.green,
                    onChanged: (value) => ref.read(authViewModelProvider.notifier).setBiometric(value),
                  ),
                  const SizedBox(height: 8),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    secondary: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.green.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.smart_toy_rounded, color: AppColors.green, size: 22),
                    ),
                    title: const Text('Robotic Car Voice'),
                    subtitle: const Text('AI voice announcements for car arming, engine immobilization, and alarms.'),
                    value: ref.watch(roboticVoiceEnabledProvider),
                    activeThumbColor: AppColors.green,
                    onChanged: (value) => ref.read(roboticVoiceEnabledProvider.notifier).setEnabled(value),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => VoiceService.instance.testRoboticVoice(),
                      icon: const Icon(Icons.record_voice_over_rounded, size: 18, color: AppColors.green),
                      label: const Text('Test Robotic Voice Greeting'),
                    ),
                  ),
                  const SizedBox(height: 14),
                  FilledButton(
                    style: FilledButton.styleFrom(backgroundColor: AppColors.red),
                    onPressed: () {
                      Navigator.pop(context);
                      ref.read(authViewModelProvider.notifier).logout();
                    },
                    child: const Text('Log out'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _WelcomeCard extends StatelessWidget {
  const _WelcomeCard({required this.name, required this.onAlerts, required this.onAccount});

  final String name;
  final VoidCallback onAlerts;
  final VoidCallback onAccount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(colors: [AppColors.red, AppColors.green]),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: onAccount,
            borderRadius: BorderRadius.circular(24),
            child: Container(
              width: 52,
              height: 52,
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
              child: Image.asset('assets/images/smrod_logo.png'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Welcome back,', style: TextStyle(color: Colors.white70, fontSize: 13)),
                Text(name, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          IconButton(
            onPressed: onAlerts,
            icon: const AssetGlyph('assets/images/notifcation.jpg', size: 32),
          ),
        ],
      ),
    );
  }

}

class _VehicleHeroCard extends StatelessWidget {
  const _VehicleHeroCard({required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final statusColor = vehicle.online ? AppColors.green : AppColors.red;
    return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: AppColors.line),
          boxShadow: const [
            BoxShadow(color: Color(0x10000000), blurRadius: 20, offset: Offset(0, 8)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                color: AppColors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.directions_car_filled_rounded, size: 36, color: AppColors.red),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(vehicle.title, style: AppTextStyles.title),
                  const SizedBox(height: 4),
                  Text(vehicle.plateNo, style: AppTextStyles.caption),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        vehicle.online ? 'Online now' : 'Offline',
                        style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('${vehicle.batteryPercent}%', style: AppTextStyles.title),
                const SizedBox(height: 4),
                const Text('Battery', style: AppTextStyles.caption),
                const SizedBox(height: 8),
                const Icon(Icons.battery_6_bar_rounded, color: AppColors.green),
              ],
            ),
          ],
        ),
    );
  }
}

class _SosCard extends StatelessWidget {
  const _SosCard();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.red,
      borderRadius: BorderRadius.circular(26),
      child: InkWell(
        borderRadius: BorderRadius.circular(26),
        onTap: () {
          VoiceService.instance.speakSosTriggered();
          context.push('/emergency');
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Need Help?',
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Tap the button to alert your contacts',
                      style: TextStyle(color: Colors.white, height: 1.3),
                    ),
                  ],
                ),
              ),
              Container(
                width: 74,
                height: 74,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                ),
                alignment: Alignment.center,
                child: const Text('SOS', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _CircleAction(icon: Icons.lock_outline, label: 'Immobilize', color: AppColors.green, onTap: () => context.push('/control')),
        _CircleAction(icon: Icons.place_outlined, label: 'Live map', color: AppColors.red, onTap: () => context.go('/track')),
        _CircleAction(icon: Icons.shield_outlined, label: 'Security', color: AppColors.red, onTap: () => context.go('/security')),
        _CircleAction(icon: Icons.radar, label: 'Geofence', color: AppColors.greenDark, onTap: () => context.push('/geofence')),
      ],
    );
  }
}

class _CircleAction extends StatelessWidget {
  const _CircleAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        width: 76,
        child: Column(
          children: [
            Container(
              width: 58,
              height: 58,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: AppTextStyles.caption),
          ],
        ),
      ),
    );
  }

}

class _FingerprintBadge extends StatelessWidget {
  const _FingerprintBadge({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.red.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(Icons.fingerprint_rounded, size: size * 0.62, color: AppColors.red),
    );
  }
}

class _AiIntelligenceCard extends StatelessWidget {
  const _AiIntelligenceCard({required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF042F2E), Color(0xFF0F3D39)],
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A0D9488),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF14B8A6).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.auto_awesome,
                      color: Color(0xFF2DD4BF),
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'AI Intelligence Engine',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF14B8A6).withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF2DD4BF).withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, size: 6, color: Color(0xFF34D399)),
                    SizedBox(width: 5),
                    Text(
                      'Connected',
                      style: TextStyle(
                        color: Color(0xFF5EEAD4),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _statColumn('Risk Score', '18/100', const Color(0xFF34D399)),
                Container(width: 1, height: 28, color: Colors.white12),
                _statColumn('Theft Guard', 'ARMED', const Color(0xFF2DD4BF)),
                Container(width: 1, height: 28, color: Colors.white12),
                _statColumn('Crash Triage', 'NORMAL', const Color(0xFF5EEAD4)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Live telemetry synchronized with Django AI Inference Engine.',
            style: TextStyle(color: Colors.white60, fontSize: 11),
          ),
        ],
      ),
    );
  }

  static Widget _statColumn(String title, String val, Color color) {
    return Column(
      children: [
        Text(title, style: const TextStyle(color: Colors.white60, fontSize: 10)),
        const SizedBox(height: 2),
        Text(
          val,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w800,
            fontSize: 13,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }
}

