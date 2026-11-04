import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Warm paper with a lacquer wash and a thin instrument arc.
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
    final red = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.red.withValues(alpha: 0.18),
          AppColors.red.withValues(alpha: 0.02),
          Colors.transparent,
        ],
        stops: const [0, 0.45, 1],
      ).createShader(Rect.fromCircle(center: Offset(size.width * 0.92, -10), radius: size.width * 0.78));
    canvas.drawCircle(Offset(size.width * 0.92, -10), size.width * 0.78, red);

    final green = Paint()
      ..shader = RadialGradient(
        colors: [
          AppColors.green.withValues(alpha: 0.14),
          Colors.transparent,
        ],
      ).createShader(Rect.fromCircle(center: Offset(-20, size.height * 0.96), radius: size.width * 0.62));
    canvas.drawCircle(Offset(-20, size.height * 0.96), size.width * 0.62, green);

    final arc = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.1
      ..color = AppColors.ink.withValues(alpha: 0.07);
    canvas.drawArc(
      Rect.fromCircle(center: Offset(size.width * 0.5, size.height * 0.18), radius: size.width * 0.72),
      math.pi * 0.08,
      math.pi * 0.84,
      false,
      arc,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
