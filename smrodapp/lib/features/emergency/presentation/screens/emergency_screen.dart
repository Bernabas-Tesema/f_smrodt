import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../vehicle/presentation/viewmodels/vehicle_viewmodel.dart';
import '../../domain/entities/emergency_event.dart';
import '../viewmodels/emergency_viewmodel.dart';
import '../widgets/sos_button.dart';

/// Emergency screen.
class EmergencyScreen extends ConsumerWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(emergencyViewModelProvider);
    final vehicle = ref.watch(vehicleViewModelProvider).vehicle;
    final sent = state.events.any((event) => event.type == EmergencyType.sos);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            CurveHeader(
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  const Expanded(
                    child: Text(
                      'SOS',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  children: [
              SosButton(
                busy: state.busy,
                onPressed: sent ? null : () => _send(context, ref),
              ),
              const SizedBox(height: 16),
              Text(
                sent ? 'SOS Activated' : 'Send SOS',
                style: const TextStyle(color: AppColors.danger, fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                sent
                    ? 'Your alert has been sent to your emergency contact.'
                    : 'This shares the last known location with your contact.',
                textAlign: TextAlign.center,
                style: AppTextStyles.caption,
              ),
              const SizedBox(height: 20),
              Container(
                decoration: AppTheme.card,
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Live location sharing', style: AppTextStyles.title),
                          SizedBox(height: 4),
                          Text('Your location is being shared in real time.', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    Container(
                      width: 64,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.green.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.place, color: AppColors.red),
                    ),
                  ],
                ),
              ),
              if (vehicle != null) ...[
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(vehicle.address, style: AppTextStyles.caption),
                ),
              ],
              const SizedBox(height: 18),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('Alert sent to', style: AppTextStyles.title),
              ),
              const SizedBox(height: 8),
              Container(
                decoration: AppTheme.card,
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFE7F0F5),
                    child: Icon(Icons.person, color: AppColors.primary),
                  ),
                  title: const Text('Emergency contact'),
                  subtitle: const Text(AppConstants.emergencyContact),
                  trailing: const Icon(Icons.call, color: AppColors.green),
                ),
              ),
              const Spacer(),
              if (state.error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(state.error!, style: AppTextStyles.caption),
                ),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: FilledButton(
                  onPressed: state.busy
                      ? null
                      : () {
                          if (sent) {
                            context.pop();
                          } else {
                            _send(context, ref);
                          }
                        },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.danger,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                  ),
                  child: Text(sent ? 'Cancel SOS' : 'Send SOS'),
                ),
              ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _send(BuildContext context, WidgetRef ref) async {
    final ok = await ref.read(emergencyViewModelProvider.notifier).sendSos();
    if (context.mounted && ok) context.showMessage('SOS sent.');
  }
}
