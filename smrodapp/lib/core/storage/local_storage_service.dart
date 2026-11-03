import 'package:shared_preferences/shared_preferences.dart';

/// Local storage service.
class LocalStorageService {
  LocalStorageService._();

  static final instance = LocalStorageService._();

  SharedPreferences? _prefs;
  final Map<String, String> _memory = {};

  Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } catch (_) {
      _prefs = null;
    }
  }

  String? getString(String key) {
    return _prefs?.getString(key) ?? _memory[key];
  }

  Future<void> setString(String key, String value) async {
    _memory[key] = value;
    try {
      await _prefs?.setString(key, value);
    } catch (_) {}
  }
}
