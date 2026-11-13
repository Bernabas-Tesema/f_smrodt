import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/app_constants.dart';
import 'router/app_router.dart';
import 'theme/app_colors.dart';
import 'theme/app_fonts.dart';
import 'theme/app_theme.dart';
import '../shared/widgets/vscu_mark.dart';
import '../features/authentication/presentation/viewmodels/auth_viewmodel.dart';

/// Application composition root.
class SmrodApp extends ConsumerStatefulWidget {
  const SmrodApp({super.key});

  @override
  ConsumerState<SmrodApp> createState() => _SmrodAppState();
}

class _SmrodAppState extends ConsumerState<SmrodApp> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(authViewModelProvider.notifier).restoreSession(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final restoring = ref.watch(authViewModelProvider).restoring;
    if (restoring) {
      return MaterialApp(
        title: AppConstants.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: const _Splash(),
      );
    }

    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}

class _Splash extends StatelessWidget {
  const _Splash();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 118,
                height: 118,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.22), width: 2),
                  boxShadow: const [
                    BoxShadow(color: Color(0x22102820), blurRadius: 22, offset: Offset(0, 10)),
                  ],
                ),
                child: const VscuMark(size: 90),
              ),
              const SizedBox(height: 18),
              Text(
                'VSCU-100',
                textAlign: TextAlign.center,
                style: AppFonts.manrope(
                  fontSize: 34,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.4,
                  color: AppColors.ink,
                ),
              ),
              const SizedBox(height: 10),
              Container(width: 72, height: 3, color: AppColors.brass),
              const SizedBox(height: 12),
              Text(
                'vehicle security control unit',
                textAlign: TextAlign.center,
                style: AppFonts.manrope(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  fontStyle: FontStyle.italic,
                  letterSpacing: 0.6,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 28),
              const CircularProgressIndicator(color: AppColors.primary),
            ],
          ),
        ),
      ),
    );
  }
}
