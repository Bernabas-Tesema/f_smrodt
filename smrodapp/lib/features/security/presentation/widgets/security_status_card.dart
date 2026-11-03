import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../vehicle/domain/entities/vehicle.dart';
import '../../domain/security_posture.dart';

/// Owner-facing answer to "is the vehicle safe right now?"
class SecurityStatusCard extends StatelessWidget {
  const SecurityStatusCard({super.key, required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final view = assessPosture(vehicle);
    final color = _color(view.posture);
    return Semantics(
      container: true,
      label: 'Security status ${view.label}. ${view.explanation}',
      child: Container(
        decoration: AppTheme.card,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Security status', style: AppTextStyles.caption),
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(_icon(view.posture), color: color, size: 28),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    view.label,
                    style: AppTextStyles.title.copyWith(color: color, letterSpacing: 0.4),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(view.explanation, style: AppTextStyles.body),
            const SizedBox(height: 12),
            for (final check in view.checks)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    Icon(
                      check.ok ? Icons.check_circle : Icons.error_outline,
                      size: 18,
                      color: check.ok ? AppColors.green : AppColors.amber,
                    ),
                    const SizedBox(width: 8),
                    Expanded(child: Text(check.label, style: AppTextStyles.body)),
                  ],
                ),
              ),
            const SizedBox(height: 4),
            Text('Updated ${DateFormatter.relative(vehicle.updatedAt)}', style: AppTextStyles.caption),
          ],
        ),
      ),
    );
  }

  Color _color(SecurityPosture posture) {
    return switch (posture) {
      SecurityPosture.protected => AppColors.green,
      SecurityPosture.attention || SecurityPosture.warning => AppColors.amber,
      SecurityPosture.critical => AppColors.red,
      SecurityPosture.offline => AppColors.muted,
    };
  }

  IconData _icon(SecurityPosture posture) {
    return switch (posture) {
      SecurityPosture.protected => Icons.verified_user_outlined,
      SecurityPosture.attention => Icons.info_outline,
      SecurityPosture.warning => Icons.warning_amber_rounded,
      SecurityPosture.critical => Icons.gpp_bad_outlined,
      SecurityPosture.offline => Icons.cloud_off_outlined,
    };
  }
}
