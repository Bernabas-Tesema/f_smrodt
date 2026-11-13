import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/alerts/voice_service.dart';
import '../../../../core/security/biometric_service.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../authentication/presentation/providers/auth_provider.dart';
import '../../domain/entities/security_event.dart';
import '../viewmodels/security_viewmodel.dart';

/// Remote control screen.
class RemoteControlScreen extends ConsumerWidget {
  const RemoteControlScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(securityViewModelProvider);
    final command = state.latestCommand;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const CurveHeader(
              title: 'Remote control',
              subtitle: 'Identity and ownership are checked before a command runs.',
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
          if (command != null)
            Container(
              decoration: AppTheme.card,
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_commandLabel(command.type), style: AppTextStyles.title),
                  Text(
                    _statusLabel(command.status),
                    style: AppTextStyles.body.copyWith(
                      color: command.status == CommandStatus.executed ? AppColors.greenDark : AppColors.amber,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(command.detail, style: AppTextStyles.caption),
                  Text(DateFormatter.relative(command.createdAt), style: AppTextStyles.caption),
                ],
              ),
            ),
          if (state.error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                'Command failed.\nReason: ${state.error}\nAction: Try again later.',
                style: AppTextStyles.body.copyWith(color: AppColors.danger),
              ),
            ),
          _CommandButton(
            label: 'Arm',
            busy: state.busy,
            onPressed: () => _send(context, ref, VehicleCommandType.arm),
          ),
          _CommandButton(
            label: 'Disarm',
            busy: state.busy,
            onPressed: () => _send(context, ref, VehicleCommandType.disarm),
          ),
          _CommandButton(
            label: 'Immobilize',
            busy: state.busy,
            filled: true,
            onPressed: () => _send(context, ref, VehicleCommandType.immobilize),
          ),
          _CommandButton(
            label: 'Restore circuit',
            busy: state.busy,
            onPressed: () => _send(context, ref, VehicleCommandType.release),
          ),
          _CommandButton(
            label: 'Request status',
            busy: state.busy,
            onPressed: () => _send(context, ref, VehicleCommandType.status),
          ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _send(BuildContext context, WidgetRef ref, VehicleCommandType type) async {
    final vehicle = ref.read(securityViewModelProvider).vehicle;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Confirm ${_commandLabel(type)}'),
        content: Text(
          'Are you sure you want to ${_commandLabel(type).toLowerCase()}?\n\n'
          'Vehicle: ${vehicle?.title ?? 'Your vehicle'}\n'
          'Status: ${vehicle?.online == true ? 'Online' : 'Offline'}',
        ),
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
    await ref.read(securityViewModelProvider.notifier).send(type);
    await VoiceService.instance.speakCommand(type, vehicleName: vehicle?.title);
  }
}

String _commandLabel(VehicleCommandType type) {
  return switch (type) {
    VehicleCommandType.arm => 'Activate security',
    VehicleCommandType.disarm => 'Deactivate security',
    VehicleCommandType.immobilize => 'Immobilize',
    VehicleCommandType.release => 'Restore circuit',
    VehicleCommandType.status => 'Request status',
  };
}

String _statusLabel(CommandStatus status) {
  return switch (status) {
    CommandStatus.pending => 'PENDING',
    CommandStatus.sent => 'SENT',
    CommandStatus.executed => 'CONFIRMED',
    CommandStatus.failed => 'FAILED',
    CommandStatus.expired => 'TIMEOUT',
  };
}

class _CommandButton extends StatelessWidget {
  const _CommandButton({
    required this.label,
    required this.busy,
    required this.onPressed,
    this.filled = false,
  });

  final String label;
  final bool busy;
  final VoidCallback onPressed;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: filled
            ? FilledButton(
                onPressed: busy ? null : onPressed,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.danger,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(label),
              )
            : OutlinedButton(
                onPressed: busy ? null : onPressed,
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: Text(label),
              ),
      ),
    );
  }
}
