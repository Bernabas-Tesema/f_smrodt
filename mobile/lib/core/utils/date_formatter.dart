/// Date formatting helpers.
class DateFormatter {
  const DateFormatter._();

  static String clock(DateTime value) {
    final local = value.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  static String relative(DateTime value) {
    final diff = DateTime.now().difference(value);
    if (diff.isNegative || diff.inSeconds < 45) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours} h ago';
    final local = value.toLocal();
    return '${local.day}/${local.month}/${local.year}';
  }
}
