import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/constants/app_constants.dart';
import 'router/app_router.dart';
import 'theme/app_colors.dart';
import 'theme/app_theme.dart';
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
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/bacimage.jpg',
            fit: BoxFit.cover,
            alignment: Alignment.centerRight,
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xF2F7F3F2),
                  Color(0xC7F7F3F2),
                  Color(0xF2F7F3F2),
                ],
              ),
            ),
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'VSCU-100',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.orbitron(
                      fontSize: 34,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.4,
                      color: AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(width: 72, height: 3, color: AppColors.red),
                  const SizedBox(height: 12),
                  Text(
                    'vehicle security control unit',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.cormorantGaramond(
                      fontSize: 20,
                      fontStyle: FontStyle.italic,
                      letterSpacing: 0.6,
                      color: AppColors.redDark,
                    ),
                  ),
                  const SizedBox(height: 28),
                  const CircularProgressIndicator(color: AppColors.red),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
