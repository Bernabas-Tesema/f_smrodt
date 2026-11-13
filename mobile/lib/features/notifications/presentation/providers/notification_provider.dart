import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/storage/pilot_store.dart';
import '../../data/datasources/notification_datasource.dart';

/// Notification provider.
final notificationDataSourceProvider = Provider<NotificationDataSource>(
  (ref) => NotificationDataSource(ref.watch(pilotStoreProvider.notifier)),
);

class NotificationController extends Notifier<List<AppNotification>> {
  @override
  List<AppNotification> build() {
    ref.watch(pilotStoreProvider);
    return ref.read(notificationDataSourceProvider).fetchAll();
  }

  void markRead(String id) {
    ref.read(notificationDataSourceProvider).markRead(id);
  }

  void markAllRead() {
    ref.read(notificationDataSourceProvider).markAllRead();
  }
}

final notificationProvider = NotifierProvider<NotificationController, List<AppNotification>>(
  NotificationController.new,
);
