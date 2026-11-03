import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// Shared empty state.
class EmptyStateView extends StatelessWidget {
  const EmptyStateView({super.key, required this.title, this.message, this.icon});

  final String title;
  final String? message;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            icon ?? const Icon(Icons.inbox_outlined, color: AppColors.muted, size: 36),
            const SizedBox(height: 12),
            Text(title, style: AppTextStyles.title, textAlign: TextAlign.center),
            if (message != null) ...[
              const SizedBox(height: 6),
              Text(message!, style: AppTextStyles.caption, textAlign: TextAlign.center),
            ],
          ],
        ),
      ),
    );
  }
}
