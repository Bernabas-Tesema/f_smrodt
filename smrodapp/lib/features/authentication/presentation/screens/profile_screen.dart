import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/alerts/voice_service.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../providers/profile_photo_provider.dart';
import '../viewmodels/auth_viewmodel.dart';

/// Owner profile.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authViewModelProvider);
    final user = auth.user;
    final photoPath = ref.watch(profilePhotoProvider);
    final voiceEnabled = ref.watch(roboticVoiceEnabledProvider);
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.fromLTRB(18, 20, 18, 18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.red, AppColors.green],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Column(
                children: [
                  _PhotoAdder(
                    path: photoPath,
                    onTap: () => _choosePhoto(context, ref),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user?.displayName ?? 'Owner',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white70),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Security & access', style: AppTextStyles.title),
            const SizedBox(height: 10),
            Container(
              decoration: AppTheme.card,
              child: ListTile(
                leading: const _FingerprintBadge(size: 44),
                title: const Text('Fingerprint screen'),
                subtitle: const Text('Open the biometric access screen.'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/biometric'),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: AppTheme.card,
              child: SwitchListTile(
                secondary: const _FingerprintBadge(size: 44),
                title: const Text('Biometric app lock'),
                subtitle: Text(
                  auth.error ??
                      'Use your fingerprint the next time the app opens.',
                ),
                value: auth.biometricEnabled,
                activeThumbColor: AppColors.green,
                onChanged: (value) => ref
                    .read(authViewModelProvider.notifier)
                    .setBiometric(value),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Preferences', style: AppTextStyles.title),
            const SizedBox(height: 10),
            Container(
              decoration: AppTheme.card,
              child: SwitchListTile(
                secondary: const Icon(Icons.record_voice_over_outlined),
                title: const Text('Robotic security voice'),
                subtitle: const Text(
                  'Announce access and each alert category aloud.',
                ),
                value: voiceEnabled,
                activeThumbColor: AppColors.green,
                onChanged: (value) => ref
                    .read(roboticVoiceEnabledProvider.notifier)
                    .setEnabled(value),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Vehicle & privacy', style: AppTextStyles.title),
            const SizedBox(height: 10),
            Container(
              decoration: AppTheme.card,
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.directions_car_outlined),
                    title: const Text('Vehicle'),
                    subtitle: const Text('Identity, device health, and risk'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/vehicle'),
                  ),
                  const Divider(height: 1),
                  const ListTile(
                    leading: Icon(Icons.shield_outlined, color: AppColors.red),
                    title: Text('Command protection'),
                    subtitle: Text(
                      'Arm, disarm, and immobilize ask for confirmation and biometrics.',
                    ),
                  ),
                  const Divider(height: 1),
                  const ListTile(
                    leading: Icon(Icons.lock_outline),
                    title: Text('Privacy'),
                    subtitle: Text(
                      'Passwords and session tokens stay in secure storage and are never shown.',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              child: FilledButton(
                onPressed: () =>
                    ref.read(authViewModelProvider.notifier).logout(),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: const Text('Log out'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _choosePhoto(BuildContext context, WidgetRef ref) async {
    final hasPhoto = ref.read(profilePhotoProvider) != null;
    final choice = await showModalBottomSheet<_PhotoChoice>(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Choose photo'),
                onTap: () => Navigator.pop(context, _PhotoChoice.gallery),
              ),
              ListTile(
                leading: const Icon(Icons.photo_camera_outlined),
                title: const Text('Take photo'),
                onTap: () => Navigator.pop(context, _PhotoChoice.camera),
              ),
              if (hasPhoto)
                ListTile(
                  leading: const Icon(
                    Icons.delete_outline,
                    color: AppColors.red,
                  ),
                  title: const Text('Remove photo'),
                  onTap: () => Navigator.pop(context, _PhotoChoice.remove),
                ),
            ],
          ),
        );
      },
    );
    if (!context.mounted || choice == null) return;
    try {
      if (choice == _PhotoChoice.remove) {
        await ref.read(profilePhotoProvider.notifier).clear();
        return;
      }
      final source = choice == _PhotoChoice.camera
          ? ImageSource.camera
          : ImageSource.gallery;
      await ref.read(profilePhotoProvider.notifier).pick(source);
    } catch (_) {
      if (context.mounted) context.showMessage('Could not add that photo.');
    }
  }
}

enum _PhotoChoice { gallery, camera, remove }

class _PhotoAdder extends StatelessWidget {
  const _PhotoAdder({required this.path, required this.onTap});

  final String? path;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final file = path == null ? null : File(path!);
    final hasPhoto = file != null && file.existsSync();
    return Semantics(
      button: true,
      label: 'Add profile photo',
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 108,
          height: 108,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x14000000),
                      blurRadius: 16,
                      offset: Offset(0, 8),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: hasPhoto
                    ? Image.file(file, fit: BoxFit.cover)
                    : const Padding(
                        padding: EdgeInsets.all(16),
                        child: Image(
                          image: AssetImage('assets/images/smrod_logo.png'),
                        ),
                      ),
              ),
              const Positioned(
                right: 4,
                bottom: 8,
                child: CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.red,
                  child: Icon(Icons.add_a_photo, size: 16, color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

}

class _FingerprintBadge extends StatelessWidget {
  const _FingerprintBadge({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.red.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(Icons.fingerprint_rounded, size: size * 0.62, color: AppColors.red),
    );
  }
}
