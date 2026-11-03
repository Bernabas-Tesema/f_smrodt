import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Soft logo-colored curves: red at the top right, green at the bottom left.
class BrandBackdrop extends StatelessWidget {
  const BrandBackdrop({super.key});

  @override
  Widget build(BuildContext context) {
    return const IgnorePointer(
      child: DecoratedBox(
        decoration: BoxDecoration(color: AppColors.background),
        child: CustomPaint(painter: _CurvePainter(), child: SizedBox.expand()),
      ),
    );
  }
}

class _CurvePainter extends CustomPainter {
  const _CurvePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final red = Paint()..color = AppColors.red.withValues(alpha: 0.14);
    final green = Paint()..color = AppColors.green.withValues(alpha: 0.16);

    canvas.drawCircle(Offset(size.width + 20, -10), size.width * 0.42, red);
    canvas.drawCircle(Offset(-30, size.height + 10), size.width * 0.48, green);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
