import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// Makes stale data explicit. Never present it as live.
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, required this.message, this.detail});

  final String message;
  final String? detail;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      color: AppColors.ink,
      child: Row(
        children: [
          const Icon(Icons.cloud_off_outlined, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(message, style: AppTextStyles.body.copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
                if (detail != null) Text(detail!, style: AppTextStyles.caption.copyWith(color: Colors.white70)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
