import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/security/biometric_service.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../domain/entities/security_event.dart';
import '../viewmodels/security_viewmodel.dart';
import '../widgets/immobilize_button.dart';
import '../widgets/security_status_card.dart';

/// Security screen.
class SecurityScreen extends ConsumerWidget {
  const SecurityScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(securityViewModelProvider);
    final vehicle = state.vehicle;
    if (vehicle == null) {
      return const Scaffold(body: Center(child: Text('Pair a vehicle to arm it.')));
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(title: const Text('Security')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SecurityStatusCard(vehicle: vehicle),
          const SizedBox(height: 12),
          ImmobilizeButton(
            immobilized: vehicle.immobilized,
            busy: state.busy,
            onPressed: () => _confirmCommand(
              context,
              ref,
              type: vehicle.immobilized ? VehicleCommandType.release : VehicleCommandType.immobilize,
              title: vehicle.immobilized ? 'Restore the circuit?' : 'Immobilize this vehicle?',
              body: vehicle.immobilized
                  ? 'This closes the relay and restores the accessory circuit.'
                  : 'This opens the relay and cuts the designated accessory circuit.',
            ),
          ),
          if (state.error != null) ...[
            const SizedBox(height: 8),
            Text('Command failed. ${state.error}', style: AppTextStyles.caption.copyWith(color: AppColors.red)),
            const Text('Try again when the device is online.', style: AppTextStyles.caption),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: state.busy
                      ? null
                      : () => _confirmCommand(
                          context,
                          ref,
                          type: vehicle.armed ? VehicleCommandType.disarm : VehicleCommandType.arm,
                          title: vehicle.armed ? 'Disarm security?' : 'Arm security?',
                          body: vehicle.armed
                              ? 'Movement alerts pause until you arm again.'
                              : 'Unauthorized movement will raise an alert.',
                        ),
                  child: Text(vehicle.armed ? 'Disarm' : 'Arm'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push('/control'),
                  child: const Text('All commands'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => ref.read(securityViewModelProvider.notifier).simulateTheft(),
            child: const Text('Simulate unauthorized movement'),
          ),
          const SizedBox(height: 8),
          const Text('Events', style: AppTextStyles.title),
          const SizedBox(height: 8),
          for (final event in state.events.take(8)) _EventTile(event: event),
        ],
      ),
    );
  }

  Future<void> _confirmCommand(
    BuildContext context,
    WidgetRef ref, {
    required VehicleCommandType type,
    required String title,
    required String body,
  }) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Confirm')),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    final biometric = await ref.read(biometricServiceProvider).authenticate('Confirm this vehicle command');
    if (!context.mounted) return;
    if (biometric == BiometricOutcome.failed) {
      context.showMessage('Command cancelled.');
      return;
    }
    final ok = await ref.read(securityViewModelProvider.notifier).send(type);
    if (!context.mounted) return;
    if (ok) {
      final detail = ref.read(securityViewModelProvider).latestCommand?.detail;
      if (detail != null) context.showMessage(detail);
    }
  }
}

class _EventTile extends StatelessWidget {
  const _EventTile({required this.event});

  final SecurityEvent event;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forSeverity(event.severity.name);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: AppTheme.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(event.title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700))),
              Text(event.severity.name, style: AppTextStyles.caption.copyWith(color: color, fontWeight: FontWeight.w700)),
            ],
          ),
          Text('${DateFormatter.relative(event.createdAt)} · score ${event.confidenceScore}', style: AppTextStyles.caption),
          if (event.factors.isNotEmpty)
            Text(event.factors.join(' · '), style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
