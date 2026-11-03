import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';

import '../../features/notifications/data/datasources/notification_datasource.dart';
import '../../features/security/domain/entities/security_event.dart';
import '../constants/app_constants.dart';
import '../security/secure_storage_service.dart';

/// Robotic AI voice announcements for connected vehicle security events and remote command execution.
class VoiceService {
  VoiceService._();

  static final VoiceService instance = VoiceService._();

  final FlutterTts _tts = FlutterTts();
  bool enabled = true;
  bool _engineReady = false;

  Future<void> load() async {
    final stored = await secureStorage.read(AppConstants.voiceKey);
    enabled = stored != '0';
    await _prepareEngine();
  }

  Future<void> _prepareEngine() async {
    if (_engineReady) return;
    try {
      if (!kIsWeb && Platform.isAndroid) {
        final engines = await _tts.getEngines;
        if (engines is List && engines.isNotEmpty) {
          final names = engines.map((engine) => engine.toString()).toList();
          final current = await _tts.getDefaultEngine;
          final chosen = current == null || current.toString().isEmpty
              ? names.first
              : current.toString();
          await _tts.setEngine(chosen);
        }
        await _tts.setQueueMode(0);
      }
      await _tts.awaitSpeakCompletion(false);
      await _tts.setVolume(1.0);
      // Robotic Voice Modulation (lowered pitch and steady cadence for cybernetic AI effect)
      await _tts.setSpeechRate(0.46);
      await _tts.setPitch(0.72);
      await _selectLanguage();
      _engineReady = true;
    } catch (_) {
      // A missing speech engine should not block the rest of the app.
    }
  }

  Future<void> _selectLanguage() async {
    try {
      for (final code in ['en-US', 'en_US', 'en']) {
        final ready = !kIsWeb && Platform.isAndroid
            ? await _tts.isLanguageInstalled(code)
            : await _tts.isLanguageAvailable(code);
        if (ready == true || ready == 1) {
          await _tts.setLanguage(code);
          return;
        }
      }
    } catch (_) {
      // Keep the engine's own language when none of these are installed.
    }
  }

  Future<void> setEnabled(bool value) async {
    enabled = value;
    await secureStorage.write(AppConstants.voiceKey, value ? '1' : '0');
    if (!value) {
      try {
        await _tts.stop();
      } catch (_) {
        // A missing speech engine is already represented by the disabled state.
      }
      return;
    }
    await speak('Robotic vehicle security assistant online.');
  }

  Future<void> speak(String message) async {
    if (!enabled || message.trim().isEmpty) return;
    try {
      await _prepareEngine();
      if (!kIsWeb && Platform.isAndroid) {
        await _tts.setQueueMode(0);
      }
      final result = await _tts.speak(message, focus: true);
      if (result == 0 || result == '0') {
        await Future<void>.delayed(const Duration(milliseconds: 400));
        await _tts.speak(message, focus: true);
      }
    } catch (_) {
      // Voice output must never block navigation or security notifications.
    }
  }

  /// Announces vehicle remote commands in a crisp, authoritative robotic voice.
  Future<void> speakCommand(VehicleCommandType type, {String? vehicleName}) async {
    final name = vehicleName != null && vehicleName.isNotEmpty ? '$vehicleName: ' : '';
    final announcement = switch (type) {
      VehicleCommandType.arm =>
        '${name}Security protocol armed. Perimeter defense and motion sensors active.',
      VehicleCommandType.disarm =>
        '${name}Security disarmed. Vehicle access granted. Welcome aboard.',
      VehicleCommandType.immobilize =>
        'Warning. Emergency engine cutoff engaged. Vehicle ${name}is now immobilized.',
      VehicleCommandType.release =>
        '${name}Fuel relay power restored. Engine ignition circuit normal.',
      VehicleCommandType.status =>
        '${name}Telemetry check completed. All VSCU edge nodes operational.',
    };
    await speak(announcement);
  }

  /// Announces VSCU edge gateway connection.
  Future<void> speakCarOnline({String? vehicleName, int? batteryPercent}) async {
    final name = vehicleName != null ? '$vehicleName ' : '';
    final battery = batteryPercent != null ? 'Battery at $batteryPercent percent.' : '';
    await speak('VSCU Edge online. ${name}GNSS satellite lock confirmed. $battery');
  }

  /// Emergency SOS announcement.
  Future<void> speakSosTriggered() async {
    await speak('Emergency SOS broadcast active. Dispatch command center and emergency contacts notified.');
  }

  /// Demo robotic voice greeting.
  Future<void> testRoboticVoice() async {
    await speak('SMROD Edge Intelligence online. All systems nominal. Security perimeter secure.');
  }

  /// Speaks each alert in order so Critical, Warning, and Info are all heard.
  Future<void> speakAlerts(List<AppNotification> alerts) async {
    if (!enabled || alerts.isEmpty) return;
    try {
      await _prepareEngine();
      final lines = alerts.take(3).map(_line).toList();
      if (!kIsWeb && Platform.isAndroid) {
        await _tts.setQueueMode(0);
      }
      await _tts.speak(lines.first, focus: true);
      if (lines.length == 1) return;
      if (!kIsWeb && Platform.isAndroid) {
        await _tts.setQueueMode(1);
      }
      for (final line in lines.skip(1)) {
        await _tts.speak(line);
      }
    } catch (_) {
      // Voice output must never block the alerts screen.
    }
  }

  String _line(AppNotification notification) {
    final severity = notification.severity.name;
    final label = '${severity[0].toUpperCase()}${severity.substring(1)}';
    return '$label alert. ${notification.title}. ${notification.body}';
  }

  Future<void> speakAlert(AppNotification notification) => speak(_line(notification));
}

final secureStorage = SecureStorageService();

class RoboticVoiceEnabledNotifier extends Notifier<bool> {
  @override
  bool build() => VoiceService.instance.enabled;

  Future<void> setEnabled(bool value) async {
    state = value;
    await VoiceService.instance.setEnabled(value);
  }
}

final roboticVoiceEnabledProvider =
    NotifierProvider<RoboticVoiceEnabledNotifier, bool>(
      RoboticVoiceEnabledNotifier.new,
    );
