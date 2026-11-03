import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../domain/entities/vehicle.dart';

/// Device status card.
class DeviceStatusCard extends StatelessWidget {
  const DeviceStatusCard({super.key, required this.vehicle});

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.card,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Device', style: AppTextStyles.title),
          const SizedBox(height: 4),
          Text(vehicle.serialNo, style: AppTextStyles.caption),
          const SizedBox(height: 12),
          _row('Main battery', '${vehicle.batteryPercent}%'),
          _row('Backup battery', '${vehicle.backupBatteryPercent}%'),
          _row('Firmware', vehicle.firmwareVersion),
          _row('Door', vehicle.doorOpen ? 'Open' : 'Closed'),
          _row('Power', vehicle.powerCut ? 'Cut — on backup' : 'Main power'),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    final alert = value.contains('Cut') || value == 'Open';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(label, style: AppTextStyles.caption)),
          Text(
            value,
            style: AppTextStyles.body.copyWith(
              fontWeight: FontWeight.w700,
              color: alert ? AppColors.red : AppColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}
