import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../app/theme/app_text_styles.dart';

/// Shared application loading indicator.
class AppLoader extends StatelessWidget {
  const AppLoader({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: AppColors.red),
          if (message != null) ...[
            const SizedBox(height: 12),
            Text(message!, style: AppTextStyles.caption),
          ],
        ],
      ),
    );
  }
}
