import 'package:flutter/material.dart';

/// Atlantic dusk, champagne brass, and cool pearl.
/// Crimson is reserved for emergencies and failures.
class AppColors {
  const AppColors._();

  static const ink = Color(0xFF101820);
  static const muted = Color(0xFF5C6B7A);
  static const line = Color(0xFFD3DEE7);
  static const background = Color(0xFFE4EDF3);
  static const paper = Color(0xFFF8FBFD);
  static const amber = Color(0xFFC4842A);

  static const primary = Color(0xFF163A5F);
  static const primaryDark = Color(0xFF0E2740);
  static const tide = Color(0xFF1A6B82);
  static const tideDark = Color(0xFF124C5E);
  static const brass = Color(0xFFC4A36A);
  static const danger = Color(0xFFC23B4A);

  /// Brand chrome. Older screens still use these names.
  static const red = primary;
  static const redDark = primaryDark;
  static const green = tide;
  static const greenDark = tideDark;

  static Color forSeverity(String severity) {
    return switch (severity) {
      'critical' => danger,
      'warning' => amber,
      'low' => tide,
      'medium' => amber,
      _ => tide,
    };
  }

  static Color forRisk(String level) {
    return switch (level) {
      'Critical' => danger,
      'Medium' => amber,
      _ => tide,
    };
  }
}
