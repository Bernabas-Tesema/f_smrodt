import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/app_loader.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../security/presentation/widgets/risk_score_card.dart';
import '../../../security/presentation/widgets/security_status_card.dart';
import '../viewmodels/vehicle_viewmodel.dart';
import '../widgets/device_status_card.dart';

/// Vehicle identity, security, and device health.
class VehicleDetailsScreen extends ConsumerWidget {
  const VehicleDetailsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicle = ref.watch(vehicleViewModelProvider).vehicle;
    if (vehicle == null) {
      return const Scaffold(body: AppLoader(message: 'Loading vehicle status...'));
    }
    final moving = vehicle.speedKph >= 3;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(vehicle.title)),
      body: Stack(
        children: [
          const BrandBackdrop(),
          ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            decoration: AppTheme.card,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(vehicle.plateNo, style: AppTextStyles.title),
                const SizedBox(height: 8),
                Text(vehicle.address, style: AppTextStyles.body),
                Text(
                  moving ? 'Moving · ${vehicle.speedKph.toStringAsFixed(0)} km/h' : 'Parked',
                  style: AppTextStyles.caption,
                ),
                Text('Last communication ${DateFormatter.relative(vehicle.updatedAt)}', style: AppTextStyles.caption),
                const SizedBox(height: 8),
                Text('Device ${vehicle.serialNo}', style: AppTextStyles.caption),
                Text('Firmware ${vehicle.firmwareVersion}', style: AppTextStyles.caption),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SecurityStatusCard(vehicle: vehicle),
          const SizedBox(height: 12),
          RiskScoreCard(vehicle: vehicle),
          const SizedBox(height: 12),
          DeviceStatusCard(vehicle: vehicle),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(onPressed: () => context.go('/track'), child: const Text('Live map')),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(onPressed: () => context.push('/control'), child: const Text('Commands')),
              ),
            ],
          ),
        ],
          ),
        ],
      ),
    );
  }
}
