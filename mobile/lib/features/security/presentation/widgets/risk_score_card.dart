import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/security_event.dart';
import '../../../vehicle/domain/entities/vehicle.dart';
import '../../domain/security_posture.dart';

/// Explainable 0–100 security risk. The score is an assessment, not a certainty.
class RiskScoreCard extends StatelessWidget {
  const RiskScoreCard({super.key, required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forRisk(vehicle.riskLevel.label);
    final posture = assessPosture(vehicle);
    return Container(
      decoration: AppTheme.card,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Security risk score', style: AppTextStyles.caption),
          const SizedBox(height: 12),
          Row(
            children: [
              SizedBox(
                width: 72,
                height: 72,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value: vehicle.riskScore / 100,
                      strokeWidth: 7,
                      backgroundColor: AppColors.line,
                      color: color,
                    ),
                    Text('${vehicle.riskScore}', style: AppTextStyles.title),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${vehicle.riskScore} / 100', style: AppTextStyles.title),
                    Text(
                      vehicle.riskLevel.label.toUpperCase(),
                      style: AppTextStyles.body.copyWith(color: color, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    const Text('AI-generated security assessment', style: AppTextStyles.caption),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text('Breakdown', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          for (final factor in vehicle.riskFactors)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(factor, style: AppTextStyles.caption),
            ),
          const SizedBox(height: 8),
          Text('Recommended action', style: AppTextStyles.caption.copyWith(color: AppColors.ink, fontWeight: FontWeight.w700)),
          Text(posture.action, style: AppTextStyles.caption),
          const SizedBox(height: 6),
          Text('Risk model ${RiskModel.version}. Weights: movement, time, location.', style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
