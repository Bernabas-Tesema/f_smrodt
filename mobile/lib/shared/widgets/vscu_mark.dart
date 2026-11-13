import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Drawn seal for VSCU-100, matched to the dusk / tide / brass interior.
class VscuMark extends StatelessWidget {
  const VscuMark({super.key, this.size = 72});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: const _VscuMarkPainter()),
    );
  }
}

class _VscuMarkPainter extends CustomPainter {
  const _VscuMarkPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final side = math.min(size.width, size.height);
    final center = Offset(size.width / 2, size.height / 2);
    final radius = side / 2;

    final disc = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.primary, AppColors.primaryDark, AppColors.tideDark],
        stops: [0, 0.55, 1],
      ).createShader(Rect.fromCircle(center: center, radius: radius));
    canvas.drawCircle(center, radius, disc);

    final rim = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = side * 0.035
      ..color = AppColors.paper.withValues(alpha: 0.7);
    canvas.drawCircle(center, radius - side * 0.06, rim);

    final arc = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = side * 0.055
      ..color = AppColors.brass;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius * 0.72),
      -math.pi * 0.95,
      math.pi * 0.72,
      false,
      arc,
    );

    final shield = Path()
      ..moveTo(center.dx, center.dy - radius * 0.34)
      ..cubicTo(
        center.dx + radius * 0.46,
        center.dy - radius * 0.28,
        center.dx + radius * 0.42,
        center.dy + radius * 0.08,
        center.dx + radius * 0.28,
        center.dy + radius * 0.22,
      )
      ..quadraticBezierTo(
        center.dx,
        center.dy + radius * 0.58,
        center.dx - radius * 0.28,
        center.dy + radius * 0.22,
      )
      ..cubicTo(
        center.dx - radius * 0.42,
        center.dy + radius * 0.08,
        center.dx - radius * 0.46,
        center.dy - radius * 0.28,
        center.dx,
        center.dy - radius * 0.34,
      )
      ..close();
    canvas.drawPath(shield, Paint()..color = AppColors.paper);

    final road = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = side * 0.055
      ..color = AppColors.tide;
    final roadPath = Path()
      ..moveTo(center.dx - radius * 0.16, center.dy - radius * 0.02)
      ..quadraticBezierTo(
        center.dx,
        center.dy + radius * 0.22,
        center.dx + radius * 0.16,
        center.dy - radius * 0.02,
      );
    canvas.drawPath(roadPath, road);

    canvas.drawCircle(
      Offset(center.dx, center.dy + radius * 0.30),
      side * 0.035,
      Paint()..color = AppColors.brass,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
