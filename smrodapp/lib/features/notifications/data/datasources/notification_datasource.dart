import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/pilot_store.dart';

/// In-app alert shown by the notification pipeline.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.severity,
    required this.createdAt,
    required this.read,
  });

  final String id;
  final String title;
  final String body;
  final AlertSeverity severity;
  final DateTime createdAt;
  final bool read;

  AppNotification copyWith({bool? read}) {
    return AppNotification(
      id: id,
      title: title,
      body: body,
      severity: severity,
      createdAt: createdAt,
      read: read ?? this.read,
    );
  }

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      severity: AlertSeverity.values.byName(json['severity'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      read: json['read'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'body': body,
    'severity': severity.name,
    'createdAt': createdAt.toIso8601String(),
    'read': read,
  };
}

/// Notification data source.
class NotificationDataSource {
  const NotificationDataSource(this._store);

  final PilotStore _store;

  List<AppNotification> fetchAll() => _store.snapshot.notifications;

  void markRead(String id) => _store.markNotificationRead(id);

  void markAllRead() => _store.markAllNotificationsRead();
}
