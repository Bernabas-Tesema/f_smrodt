import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';

/// SOS button.
class SosButton extends StatelessWidget {
  const SosButton({super.key, required this.busy, required this.onPressed});

  final bool busy;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 210,
      height: 210,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.red.withValues(alpha: 0.12)),
            ),
          ),
          Container(
            width: 156,
            height: 156,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.red.withValues(alpha: 0.08),
            ),
          ),
          SizedBox(
            width: 112,
            height: 112,
            child: FilledButton(
              onPressed: busy ? null : onPressed,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.red,
                shape: const CircleBorder(),
                padding: EdgeInsets.zero,
              ),
              child: busy
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Icon(Icons.notifications, color: Colors.white, size: 42),
            ),
          ),
        ],
      ),
    );
  }
}
