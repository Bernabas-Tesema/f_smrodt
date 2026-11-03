import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/alerts/voice_service.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/widgets/asset_glyph.dart';
import '../../../../shared/widgets/empty_state_view.dart';
import '../providers/notification_provider.dart';
import '../widgets/notification_tile.dart';

/// Security notification center.
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  AlertSeverity? _filter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _speakVisible());
  }

  void _speakVisible() {
    final alerts = ref.read(notificationProvider);
    final visible = _filter == null
        ? alerts
        : alerts.where((alert) => alert.severity == _filter).toList();
    VoiceService.instance.speakAlerts(visible);
  }

  @override
  Widget build(BuildContext context) {
    final alerts = ref.watch(notificationProvider);
    final visible = _filter == null ? alerts : alerts.where((alert) => alert.severity == _filter).toList();
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Alerts'),
        actions: [
          TextButton(
            onPressed: alerts.isEmpty ? null : () => ref.read(notificationProvider.notifier).markAllRead(),
            child: const Text('Mark read'),
          ),
        ],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _chip('All', null),
                _chip('Critical', AlertSeverity.critical),
                _chip('Warning', AlertSeverity.warning),
                _chip('Info', AlertSeverity.info),
              ],
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const EmptyStateView(
                    title: 'No security events yet',
                    message: 'Alerts for theft, movement, and device health appear here.',
                    icon: AssetGlyph('assets/images/alert.jpg', size: 72),
                  )
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      for (final alert in visible)
                        NotificationTile(
                          notification: alert,
                          onTap: () => ref.read(notificationProvider.notifier).markRead(alert.id),
                        ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, AlertSeverity? value) {
    final selected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        selectedColor: AppColors.red.withValues(alpha: 0.12),
        checkmarkColor: AppColors.red,
        onSelected: (_) {
          setState(() => _filter = value);
          _speakVisible();
        },
      ),
    );
  }
}
