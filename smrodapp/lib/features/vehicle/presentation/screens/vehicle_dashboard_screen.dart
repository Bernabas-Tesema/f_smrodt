import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/alerts/voice_service.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../authentication/presentation/viewmodels/auth_viewmodel.dart';
import '../../../security/presentation/providers/ai_provider.dart';
import '../../../security/presentation/widgets/security_status_card.dart';
import '../../../security/data/datasources/ai_remote_datasource.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../../shared/widgets/vscu_mark.dart';
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
        bottom: false,
        child: Column(
          children: [
            CurveHeader(
              child: _WelcomeCard(
                name: user?.displayName ?? 'Owner',
                onAlerts: () => context.go('/alerts'),
                onAccount: () => _account(context),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
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
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 4, 0, 0),
      child: Row(
        children: [
          InkWell(
            onTap: onAccount,
            borderRadius: BorderRadius.circular(28),
            child: Container(
              width: 52,
              height: 52,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.background,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.7)),
              ),
              child: const VscuMark(size: 44),
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
            icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 26),
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
    final statusColor = vehicle.online ? AppColors.tide : AppColors.danger;
    return Container(
        padding: const EdgeInsets.all(18),
        decoration: AppTheme.card,
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
      color: AppColors.primaryDark,
      borderRadius: BorderRadius.circular(28),
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
                  color: AppColors.danger,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
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
        _CircleAction(icon: Icons.lock_outline, label: 'Immobilize', color: AppColors.tide, onTap: () => context.push('/control')),
        _CircleAction(icon: Icons.place_outlined, label: 'Live map', color: AppColors.primary, onTap: () => context.go('/track')),
        _CircleAction(icon: Icons.shield_outlined, label: 'Security', color: AppColors.primaryDark, onTap: () => context.go('/security')),
        _CircleAction(icon: Icons.radar, label: 'Geofence', color: AppColors.brass, onTap: () => context.push('/geofence')),
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
              width: 62,
              height: 62,
              decoration: BoxDecoration(
                color: AppColors.paper,
                shape: BoxShape.circle,
                border: Border.all(color: color.withValues(alpha: 0.35)),
                boxShadow: const [
                  BoxShadow(color: Color(0x10141816), blurRadius: 16, offset: Offset(0, 8)),
                ],
              ),
              child: Icon(icon, color: color),
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

class _AiIntelligenceCard extends ConsumerWidget {
  const _AiIntelligenceCard({required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncAi = ref.watch(aiOverviewProvider);
    final snapshot = asyncAi.value ??
        AiOverviewSnapshot.fallback(riskScore: vehicle.riskScore);
    final loading = asyncAi.isLoading;
    final connected = snapshot.connected;
    final riskColor = snapshot.riskScore >= 70
        ? const Color(0xFFFFB4B4)
        : snapshot.riskScore >= 40
            ? const Color(0xFFE7C98A)
            : const Color(0xFFD5E8F0);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: AppColors.primaryDark,
        boxShadow: const [
          BoxShadow(color: Color(0x24141816), blurRadius: 24, offset: Offset(0, 12)),
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
                      color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.auto_awesome,
                      color: Colors.white,
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
              InkWell(
                onTap: () => ref.invalidate(aiOverviewProvider),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.circle,
                        size: 6,
                        color: loading
                            ? Colors.white54
                            : connected
                                ? AppColors.brass
                                : const Color(0xFFFFB4B4),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        loading
                            ? 'Syncing'
                            : connected
                                ? 'Live Django'
                                : 'Offline',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
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
                _statColumn('Risk Score', '${snapshot.riskScore}/100', riskColor),
                Container(width: 1, height: 28, color: Colors.white12),
                _statColumn('Theft Guard', snapshot.theftLabel, Colors.white),
                Container(width: 1, height: 28, color: Colors.white12),
                _statColumn('Crash Triage', snapshot.crashLabel, Colors.white),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            connected
                ? '${snapshot.provider} · ${snapshot.model}'
                : 'Start Django (`python manage.py runserver`) to load live AI.',
            style: const TextStyle(color: Colors.white70, fontSize: 11),
          ),
          if (snapshot.insights.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              snapshot.insights.first,
              style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.35),
            ),
          ],
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

