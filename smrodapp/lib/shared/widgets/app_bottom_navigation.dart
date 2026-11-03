import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';

/// Shared bottom navigation.
class AppBottomNavigation extends StatelessWidget {
  const AppBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.unreadCount,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;
  final int unreadCount;

  @override
  Widget build(BuildContext context) {
    final alertIcon = unreadCount > 0
        ? Badge(
            label: Text(unreadCount > 9 ? '9+' : '$unreadCount'),
            child: const Icon(Icons.notifications_outlined),
          )
        : const Icon(Icons.notifications_outlined);
    final alertSelected = unreadCount > 0
        ? Badge(
            label: Text(unreadCount > 9 ? '9+' : '$unreadCount'),
            child: const Icon(Icons.notifications),
          )
        : const Icon(Icons.notifications);

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x18000000),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: NavigationBar(
        height: 74,
        elevation: 0,
        selectedIndex: currentIndex,
        onDestinationSelected: onTap,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map_rounded),
            label: 'Track',
          ),
          const NavigationDestination(
            icon: IconTheme(
              data: IconThemeData(color: AppColors.red),
              child: Icon(Icons.shield_outlined),
            ),
            selectedIcon: IconTheme(
              data: IconThemeData(color: AppColors.red),
              child: Icon(Icons.shield_rounded),
            ),
            label: 'Security',
          ),
          NavigationDestination(
            icon: alertIcon,
            selectedIcon: alertSelected,
            label: 'Alerts',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
