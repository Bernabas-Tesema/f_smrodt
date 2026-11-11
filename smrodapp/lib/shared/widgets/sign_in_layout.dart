import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import 'brand_backdrop.dart';
import 'vscu_mark.dart';

/// Same frame as the sign-in screen: curves, logo, centered title, labeled fields.
class SignInPage extends StatelessWidget {
  const SignInPage({super.key, required this.children, this.onBack});

  final List<Widget> children;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            CurveHeader(
              child: Column(
                children: [
                  if (onBack != null)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: onBack,
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                      ),
                    ),
                  const Center(child: LogoBadge()),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 28),
              child: Column(children: children),
            ),
          ],
        ),
      ),
    );
  }
}

class LogoBadge extends StatelessWidget {
  const LogoBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 108,
      height: 108,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.background,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.22), width: 2),
        boxShadow: const [
          BoxShadow(color: Color(0x22102820), blurRadius: 22, offset: Offset(0, 10)),
        ],
      ),
      child: const VscuMark(size: 84),
    );
  }
}

class SignInHeading extends StatelessWidget {
  const SignInHeading({super.key, required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.ink, letterSpacing: -0.6),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16, height: 1.4, color: AppColors.muted),
        ),
        const SizedBox(height: 36),
      ],
    );
  }
}

class SignInLabel extends StatelessWidget {
  const SignInLabel(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ink)),
    );
  }
}

InputDecoration signInField({required String hint, required IconData icon, Widget? suffix}) {
  return InputDecoration(
    hintText: hint,
    prefixIcon: Icon(icon, color: AppColors.muted),
    suffixIcon: suffix,
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.primary, width: 1.4),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.danger),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.danger, width: 1.4),
    ),
  );
}

/// Full-screen pages outside the bottom navigation use the same backdrop as sign-in.
class BrandScaffold extends StatelessWidget {
  const BrandScaffold({super.key, this.appBar, required this.body});

  final PreferredSizeWidget? appBar;
  final Widget body;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: appBar,
      body: Stack(
        children: [
          const BrandBackdrop(),
          body,
        ],
      ),
    );
  }
}

class SignInButton extends StatelessWidget {
  const SignInButton({super.key, required this.label, required this.onPressed, this.loading = false});

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: FilledButton(
        onPressed: loading ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.red,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: loading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
