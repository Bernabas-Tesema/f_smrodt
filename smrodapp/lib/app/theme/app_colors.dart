import 'package:flutter/material.dart';

/// Warm paper, lacquer red, and ink. One palette for every screen.
class AppColors {
  const AppColors._();

  static const red = Color(0xFFC81D1D);
  static const redDark = Color(0xFF8C1212);
  static const green = Color(0xFF0E8A55);
  static const greenDark = Color(0xFF0A5C39);
  static const ink = Color(0xFF141816);
  static const muted = Color(0xFF6B726C);
  static const line = Color(0xFFE4DDD4);
  static const background = Color(0xFFF3EEE6);
  static const paper = Color(0xFFFFFCF8);
  static const amber = Color(0xFFB56A10);

  static Color forSeverity(String severity) {
    return switch (severity) {
      'critical' => red,
      'warning' => amber,
      'low' => green,
      'medium' => amber,
      _ => green,
    };
  }

  static Color forRisk(String level) {
    return switch (level) {
      'Critical' => red,
      'Medium' => amber,
      _ => green,
    };
  }
}
