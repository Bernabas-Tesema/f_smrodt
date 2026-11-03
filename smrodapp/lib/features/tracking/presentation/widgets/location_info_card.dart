import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../domain/entities/vehicle_location.dart';

/// Location information card.
class LocationInfoCard extends StatelessWidget {
  const LocationInfoCard({super.key, required this.location, this.cached = false});

  final VehicleLocation location;
  final bool cached;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppTheme.card,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(cached ? 'Last known location' : 'Live', style: AppTextStyles.title)),
              Text(
                cached ? 'OFFLINE' : 'LIVE',
                style: AppTextStyles.caption.copyWith(
                  color: cached ? AppColors.muted : AppColors.green,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(location.address, style: AppTextStyles.body),
          Text(
            '${location.latitude.toStringAsFixed(5)}, ${location.longitude.toStringAsFixed(5)}',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: 6),
          Text(
            cached
                ? 'Vehicle connection unavailable. Last updated ${DateFormatter.relative(location.timestamp)}.'
                : '${location.speedKph.toStringAsFixed(0)} km/h · Updated ${DateFormatter.relative(location.timestamp)}',
            style: AppTextStyles.body,
          ),
        ],
      ),
    );
  }
}
