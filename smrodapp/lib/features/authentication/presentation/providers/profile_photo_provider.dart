import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../viewmodels/auth_viewmodel.dart';

/// Local profile photo for the signed-in owner.
final profilePhotoProvider = NotifierProvider<ProfilePhotoNotifier, String?>(ProfilePhotoNotifier.new);

class ProfilePhotoNotifier extends Notifier<String?> {
  final _picker = ImagePicker();

  @override
  String? build() {
    final userId = ref.watch(authViewModelProvider).user?.id;
    Future<void>.microtask(() => _load(userId));
    return null;
  }

  Future<void> pick(ImageSource source) async {
    final userId = ref.read(authViewModelProvider).user?.id;
    final picked = await _picker.pickImage(source: source, maxWidth: 1024, imageQuality: 85);
    if (picked == null || userId == null) return;
    final directory = await getApplicationDocumentsDirectory();
    final saved = await File(picked.path).copy('${directory.path}/profile_$userId.jpg');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key(userId), saved.path);
    state = saved.path;
  }

  Future<void> clear() async {
    final userId = ref.read(authViewModelProvider).user?.id;
    if (userId == null) return;
    final prefs = await SharedPreferences.getInstance();
    final path = prefs.getString(_key(userId));
    if (path != null) {
      final file = File(path);
      if (file.existsSync()) await file.delete();
    }
    await prefs.remove(_key(userId));
    state = null;
  }

  Future<void> _load(String? userId) async {
    if (userId == null) return;
    final prefs = await SharedPreferences.getInstance();
    final path = prefs.getString(_key(userId));
    if (path == null || !File(path).existsSync()) return;
    if (ref.read(authViewModelProvider).user?.id == userId) state = path;
  }

  String _key(String userId) => 'profile_photo_$userId';
}
