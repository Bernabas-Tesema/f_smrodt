import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../shared/widgets/asset_glyph.dart';
import '../../data/datasources/notification_datasource.dart';

/// Notification tile.
class NotificationTile extends StatelessWidget {
  const NotificationTile({super.key, required this.notification, required this.onTap});

  final AppNotification notification;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          child: Container(
            decoration: AppTheme.card,
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const AssetGlyph('assets/images/alert.jpg', size: 42),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notification.severity.name.toUpperCase(),
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.forSeverity(notification.severity.name),
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        notification.title,
                        style: AppTextStyles.body.copyWith(
                          fontWeight: notification.read ? FontWeight.w500 : FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(notification.body, style: AppTextStyles.caption),
                      const SizedBox(height: 4),
                      Text(DateFormatter.relative(notification.createdAt), style: AppTextStyles.caption),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
