import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../domain/entities/vehicle.dart';

/// Vehicle status card.
class VehicleStatusCard extends StatelessWidget {
  const VehicleStatusCard({super.key, required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.card,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(child: Text('Vehicle', style: AppTextStyles.title)),
              _Pill(
                label: vehicle.online ? 'Online' : 'Offline',
                color: vehicle.online ? AppColors.green : AppColors.red,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _Pill(
                label: vehicle.armed ? 'Armed' : 'Disarmed',
                color: vehicle.armed ? AppColors.green : AppColors.amber,
              ),
              _Pill(
                label: vehicle.immobilized ? 'Immobilized' : 'Circuit closed',
                color: vehicle.immobilized ? AppColors.red : AppColors.green,
              ),
              _Pill(
                label: '${vehicle.speedKph.toStringAsFixed(0)} km/h',
                color: AppColors.ink,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: AppTextStyles.caption.copyWith(color: color, fontWeight: FontWeight.w700)),
    );
  }
}

class RiskBanner extends StatelessWidget {
  const RiskBanner({super.key, required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.forRisk(vehicle.riskLevel.label);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${vehicle.riskLevel.label} risk · ${vehicle.riskScore}',
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            'Model ${RiskModelVersion.label}',
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 8),
          for (final factor in vehicle.riskFactors)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Text('· $factor', style: const TextStyle(color: Colors.white)),
            ),
        ],
      ),
    );
  }
}

class RiskModelVersion {
  const RiskModelVersion._();
  static const label = '1.0.0 · movement 45 · time 25 · location 30';
}
