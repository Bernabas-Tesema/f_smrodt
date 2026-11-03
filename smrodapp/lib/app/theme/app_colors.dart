import 'package:flutter/material.dart';

/// Application color palette taken from the SMROD mark.
class AppColors {
  const AppColors._();

  static const red = Color(0xFFE83020);
  static const redDark = Color(0xFFB42316);
  static const green = Color(0xFF009848);
  static const greenDark = Color(0xFF067A3C);
  static const ink = Color(0xFF17211C);
  static const muted = Color(0xFF5E6B64);
  static const line = Color(0xFFE2E8E4);
  static const background = Color(0xFFF7F3F2);
  static const amber = Color(0xFFC47B12);

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
