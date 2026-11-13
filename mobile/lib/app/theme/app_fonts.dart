import 'package:flutter/material.dart';

/// Local bundled fonts — no runtime fetch from fonts.gstatic.com.
class AppFonts {
  const AppFonts._();

  static const family = 'Manrope';

  static TextStyle manrope({
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
    double? height,
    double? letterSpacing,
    FontStyle? fontStyle,
  }) {
    return TextStyle(
      fontFamily: family,
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
      fontStyle: fontStyle,
    );
  }

  static TextTheme textTheme([TextTheme? base]) {
    final theme = base ?? ThemeData.light().textTheme;
    return theme.apply(fontFamily: family);
  }
}
