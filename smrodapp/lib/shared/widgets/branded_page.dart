import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import 'brand_backdrop.dart';

/// Sign-in page frame: curves, circular logo, centered title, then the form.
class BrandedPage extends StatelessWidget {
  const BrandedPage({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
    this.onBack,
    this.centered = false,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final VoidCallback? onBack;
  final bool centered;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          const BrandBackdrop(),
          SafeArea(
            child: centered ? _centeredBody(context) : _topBody(),
          ),
        ],
      ),
    );
  }

  Widget _topBody() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
      children: _content(topGap: onBack == null),
    );
  }

  Widget _centeredBody(BuildContext context) {
    return Stack(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight - 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _content(topGap: false, includeBack: false),
                ),
              ),
            );
          },
        ),
        if (onBack != null)
          Align(
            alignment: Alignment.topLeft,
            child: IconButton(
              onPressed: onBack,
              icon: const Icon(Icons.arrow_back, color: AppColors.ink),
            ),
          ),
      ],
    );
  }

  List<Widget> _content({required bool topGap, bool includeBack = true}) {
    return [
      if (includeBack && onBack != null)
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            onPressed: onBack,
            icon: const Icon(Icons.arrow_back, color: AppColors.ink),
          ),
        )
      else if (topGap)
        const SizedBox(height: 20),
      const Center(child: BrandLogoBadge()),
      const SizedBox(height: 28),
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
      ...children,
    ];
  }
}

class BrandLogoBadge extends StatelessWidget {
  const BrandLogoBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 92,
      height: 92,
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: Color(0x14000000), blurRadius: 16, offset: Offset(0, 8))],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Image.asset('assets/images/smrod_logo.png'),
          const Positioned(
            right: -2,
            bottom: -2,
            child: Icon(Icons.circle, size: 12, color: AppColors.green),
          ),
        ],
      ),
    );
  }
}

class BrandedButton extends StatelessWidget {
  const BrandedButton({super.key, required this.label, required this.onPressed, this.loading = false});

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

class BrandedField extends StatelessWidget {
  const BrandedField({
    super.key,
    required this.label,
    required this.child,
  });

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ink)),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

InputDecoration brandedInput({required String hint, IconData? icon, Widget? suffix}) {
  return InputDecoration(
    hintText: hint,
    prefixIcon: icon == null ? null : Icon(icon, color: AppColors.muted),
    suffixIcon: suffix,
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.red, width: 1.4),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.red),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: AppColors.red, width: 1.4),
    ),
  );
}
