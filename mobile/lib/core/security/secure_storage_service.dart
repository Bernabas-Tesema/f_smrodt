import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure storage service.
class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;
  final Map<String, String> _memory = {};

  Future<void> write(String key, String value) async {
    _memory[key] = value;
    try {
      await _storage
          .write(key: key, value: value)
          .timeout(const Duration(milliseconds: 400));
    } catch (_) {
      // Desktop tests and unsupported platforms keep the in-memory copy.
    }
  }

  Future<String?> read(String key) async {
    try {
      final stored = await _storage.read(key: key).timeout(const Duration(milliseconds: 400));
      if (stored != null) {
        _memory[key] = stored;
        return stored;
      }
    } catch (_) {}
    return _memory[key];
  }

  Future<void> delete(String key) async {
    _memory.remove(key);
    try {
      await _storage.delete(key: key).timeout(const Duration(milliseconds: 400));
    } catch (_) {}
  }
}
