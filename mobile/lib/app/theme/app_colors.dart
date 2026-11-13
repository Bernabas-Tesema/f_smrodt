import 'package:flutter/material.dart';

/// Electric purple brand, soft lilac pages.
/// Crimson is reserved for emergencies and failures.
class AppColors {
  const AppColors._();

  static const ink = Color(0xFF1A1030);
  static const muted = Color(0xFF6B5F82);
  static const line = Color(0xFFE4D9F5);
  static const background = Color(0xFFF4F0FB);
  static const paper = Color(0xFFFBF8FF);
  static const amber = Color(0xFFC4842A);

  static const primary = Color(0xFF6A00FF);
  static const primaryDark = Color(0xFF4A00B8);
  static const tide = Color(0xFF8B3DFF);
  static const tideDark = Color(0xFF6A00FF);
  static const brass = Color(0xFFD4B3FF);
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
