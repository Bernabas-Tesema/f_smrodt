import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../viewmodels/auth_viewmodel.dart';

/// Fingerprint unlock shown before sign-in when biometric lock is enabled.
class BiometricGateScreen extends ConsumerStatefulWidget {
  const BiometricGateScreen({super.key});

  @override
  ConsumerState<BiometricGateScreen> createState() => _BiometricGateScreenState();
}

class _BiometricGateScreenState extends ConsumerState<BiometricGateScreen> {
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _unlock());
  }

  Future<void> _unlock() async {
    if (_busy) return;
    setState(() => _busy = true);
    final unlocked =
        await ref.read(authViewModelProvider.notifier).unlockWithBiometric();
    if (!mounted) return;
    setState(() => _busy = false);
    if (unlocked) {
      context.go('/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authViewModelProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          const BrandBackdrop(),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) => SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                    child: Column(
                      children: [
                        Align(
                          alignment: Alignment.centerLeft,
                          child: IconButton(
                            onPressed: () => context.go('/login'),
                            icon: const Icon(Icons.arrow_back, color: AppColors.ink),
                          ),
                        ),
                        const Spacer(flex: 2),
                        const BrandLogoBadge(),
                        const SizedBox(height: 16),
                        Text(
                          AppConstants.appName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 44),
                        const Text(
                          'Secure access',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Confirm your identity to continue to your vehicle dashboard.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            height: 1.4,
                            color: AppColors.ink,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 28),
                        Container(
                          width: 148,
                          height: 148,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 0.16),
                              width: 8,
                            ),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x18000000),
                                blurRadius: 24,
                                offset: Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.fingerprint_rounded,
                            size: 88,
                            color: _busy ? AppColors.muted : AppColors.primary,
                          ),
                        ),
                        if (auth.error != null) ...[
                          const SizedBox(height: 16),
                          Text(
                            auth.error!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: AppColors.danger, fontSize: 13),
                          ),
                        ],
                        const Spacer(flex: 3),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                            ),
                            onPressed: _busy ? null : _unlock,
                            child: _busy
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Unlock with fingerprint'),
                          ),
                        ),
                        TextButton(
                          onPressed: _busy ? null : () => context.go('/login'),
                          child: const Text('Use password login'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
