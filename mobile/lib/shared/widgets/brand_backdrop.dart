import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Flat page field. Title bars use [CurveHeader] and stay fixed above the body.
class BrandBackdrop extends StatelessWidget {
  const BrandBackdrop({super.key});

  @override
  Widget build(BuildContext context) {
    return const IgnorePointer(
      child: ColoredBox(color: AppColors.background, child: SizedBox.expand()),
    );
  }
}

/// Matching dusk sweeps in the bottom-left and bottom-right corners.
class CornerCurves extends StatelessWidget {
  const CornerCurves({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final curveWidth = width * 0.4;
    const curveHeight = 108.0;

    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            left: 0,
            bottom: 0,
            child: CustomPaint(
              painter: const _CornerCurvePainter(corner: _Corner.bottomLeft),
              child: SizedBox(width: curveWidth, height: curveHeight),
            ),
          ),
          Positioned(
            right: 0,
            bottom: 0,
            child: CustomPaint(
              painter: const _CornerCurvePainter(corner: _Corner.bottomRight),
              child: SizedBox(width: curveWidth, height: curveHeight),
            ),
          ),
        ],
      ),
    );
  }
}

/// Kept for older call sites; prefer [CornerCurves].
class BottomLeftCurve extends StatelessWidget {
  const BottomLeftCurve({super.key});

  @override
  Widget build(BuildContext context) => const CornerCurves();
}

/// Fixed dusk title bar. The body below it scrolls on its own.
class CurveHeader extends StatelessWidget {
  const CurveHeader({
    super.key,
    this.title,
    this.subtitle,
    this.trailing,
    this.child,
  });

  final String? title;
  final String? subtitle;
  final Widget? trailing;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: const _CurvePainter(),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 16, 28),
        child: child ??
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        title ?? '',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.4,
                        ),
                      ),
                    ),
                    if (trailing != null) trailing!,
                  ],
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle!,
                    style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.35),
                  ),
                ],
              ],
            ),
      ),
    );
  }
}

class _CurvePainter extends CustomPainter {
  const _CurvePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final crest = size.height;
    final wave = Path()
      ..moveTo(0, 0)
      ..lineTo(0, crest * 0.72)
      ..cubicTo(
        size.width * 0.28,
        crest,
        size.width * 0.72,
        crest * 0.48,
        size.width,
        crest * 0.70,
      )
      ..lineTo(size.width, 0)
      ..close();

    final fill = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.primaryDark, AppColors.primary, AppColors.tide],
        stops: [0, 0.48, 1],
      ).createShader(Rect.fromLTWH(0, 0, size.width, crest));
    canvas.drawPath(wave, fill);

    final lip = Path()
      ..moveTo(0, crest * 0.72)
      ..cubicTo(
        size.width * 0.28,
        crest,
        size.width * 0.72,
        crest * 0.48,
        size.width,
        crest * 0.70,
      );
    canvas.drawPath(
      lip,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round
        ..color = AppColors.brass.withValues(alpha: 0.9),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

enum _Corner { bottomLeft, bottomRight }

class _CornerCurvePainter extends CustomPainter {
  const _CornerCurvePainter({required this.corner});

  final _Corner corner;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final Path wave;
    final Path lip;
    final Path inner;
    final Alignment begin;
    final Alignment end;

    if (corner == _Corner.bottomLeft) {
      begin = Alignment.bottomLeft;
      end = Alignment.topRight;
      wave = Path()
        ..moveTo(0, h)
        ..lineTo(0, h * 0.30)
        ..cubicTo(w * 0.22, h * 0.04, w * 0.18, h * 0.46, w * 0.42, h * 0.42)
        ..cubicTo(w * 0.68, h * 0.38, w * 0.62, h * 0.78, w * 0.92, h)
        ..close();
      lip = Path()
        ..moveTo(0, h * 0.30)
        ..cubicTo(w * 0.22, h * 0.04, w * 0.18, h * 0.46, w * 0.42, h * 0.42)
        ..cubicTo(w * 0.68, h * 0.38, w * 0.62, h * 0.78, w * 0.92, h);
      inner = Path()
        ..moveTo(0, h * 0.50)
        ..cubicTo(w * 0.16, h * 0.30, w * 0.22, h * 0.58, w * 0.40, h * 0.56)
        ..cubicTo(w * 0.58, h * 0.54, w * 0.56, h * 0.82, w * 0.74, h);
    } else {
      begin = Alignment.bottomRight;
      end = Alignment.topLeft;
      wave = Path()
        ..moveTo(w, h)
        ..lineTo(w, h * 0.30)
        ..cubicTo(w * 0.78, h * 0.04, w * 0.82, h * 0.46, w * 0.58, h * 0.42)
        ..cubicTo(w * 0.32, h * 0.38, w * 0.38, h * 0.78, w * 0.08, h)
        ..close();
      lip = Path()
        ..moveTo(w, h * 0.30)
        ..cubicTo(w * 0.78, h * 0.04, w * 0.82, h * 0.46, w * 0.58, h * 0.42)
        ..cubicTo(w * 0.32, h * 0.38, w * 0.38, h * 0.78, w * 0.08, h);
      inner = Path()
        ..moveTo(w, h * 0.50)
        ..cubicTo(w * 0.84, h * 0.30, w * 0.78, h * 0.58, w * 0.60, h * 0.56)
        ..cubicTo(w * 0.42, h * 0.54, w * 0.44, h * 0.82, w * 0.26, h);
    }

    final fill = Paint()
      ..shader = LinearGradient(
        begin: begin,
        end: end,
        colors: const [AppColors.primaryDark, AppColors.primary, AppColors.tide],
        stops: const [0, 0.5, 1],
      ).createShader(Offset.zero & size);
    canvas.drawPath(wave, fill);

    canvas.drawPath(
      lip,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.4
        ..strokeCap = StrokeCap.round
        ..color = AppColors.brass.withValues(alpha: 0.92),
    );

    canvas.drawPath(
      inner,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2
        ..strokeCap = StrokeCap.round
        ..color = Colors.white.withValues(alpha: 0.28),
    );
  }

  @override
  bool shouldRepaint(covariant _CornerCurvePainter oldDelegate) => oldDelegate.corner != corner;
}
