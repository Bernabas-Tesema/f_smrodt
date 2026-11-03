import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/theme/app_colors.dart';
import '../../core/alerts/voice_service.dart';
import '../../core/alerts/critical_alert_sound.dart';
import '../../core/constants/app_constants.dart';
import '../../core/storage/pilot_store.dart';
import '../extensions/context_extensions.dart';
import 'app_bottom_navigation.dart';
import 'brand_backdrop.dart';

/// Shared application scaffold.
class AppScaffold extends ConsumerWidget {
  const AppScaffold({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unread = ref.watch(pilotStoreProvider).unreadCount;
    ref.listen(pilotStoreProvider, (previous, next) {
      if (previous == null || next.notifications.isEmpty) return;
      final latest = next.notifications.first;
      final previousId = previous.notifications.isEmpty
          ? null
          : previous.notifications.first.id;
      if (latest.id != previousId &&
          latest.severity == AlertSeverity.critical) {
        context.showMessage(latest.title);
        CriticalAlertSound.instance.play();
      }
      if (latest.id != previousId) {
        VoiceService.instance.speakAlert(latest);
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(children: [const BrandBackdrop(), navigationShell]),
      bottomNavigationBar: AppBottomNavigation(
        currentIndex: navigationShell.currentIndex,
        unreadCount: unread,
        onTap: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
      ),
    );
  }
}
