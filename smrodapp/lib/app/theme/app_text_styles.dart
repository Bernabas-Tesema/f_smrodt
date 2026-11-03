import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Application text styles.
class AppTextStyles {
  const AppTextStyles._();

  static const heading = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.ink,
    letterSpacing: -0.6,
  );

  static const title = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
    color: AppColors.ink,
    letterSpacing: -0.2,
  );

  static const body = TextStyle(
    fontSize: 14,
    height: 1.4,
    color: AppColors.ink,
  );

  static const caption = TextStyle(
    fontSize: 12,
    height: 1.35,
    color: AppColors.muted,
  );
}
