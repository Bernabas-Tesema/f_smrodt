import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';

/// Immobilize button.
class ImmobilizeButton extends StatelessWidget {
  const ImmobilizeButton({
    super.key,
    required this.immobilized,
    required this.busy,
    required this.onPressed,
  });

  final bool immobilized;
  final bool busy;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final color = immobilized ? AppColors.green : AppColors.red;
    return SizedBox(
      width: double.infinity,
      height: 64,
      child: FilledButton.icon(
        onPressed: busy ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: color,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        icon: busy
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Icon(immobilized ? Icons.lock_open : Icons.lock),
        label: Text(
          immobilized ? 'Restore circuit' : 'Immobilize',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}
