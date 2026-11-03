import 'dart:math' as math;
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';

/// Short warning tone played only when a new critical alert arrives.
class CriticalAlertSound {
  CriticalAlertSound._();

  static final CriticalAlertSound instance = CriticalAlertSound._();

  AudioPlayer? _player;
  static final Uint8List _wav = _warningWav();

  Future<void> play() async {
    try {
      final player = _player ??= AudioPlayer();
      await player.stop();
      await player.play(BytesSource(_wav));
    } catch (_) {
      // Missing audio output should not block the alert banner.
    }
  }
}

Uint8List _warningWav() {
  const sampleRate = 22050;
  final samples = <int>[];

  void tone(double frequency, double seconds) {
    final count = (sampleRate * seconds).round();
    for (var i = 0; i < count; i++) {
      final attack = (i / 180).clamp(0.0, 1.0);
      final release = ((count - i) / 500).clamp(0.0, 1.0);
      final wave = math.sin(2 * math.pi * frequency * i / sampleRate);
      samples.add((wave * attack * release * 0.55 * 32767).round());
    }
  }

  void silence(double seconds) {
    samples.addAll(List.filled((sampleRate * seconds).round(), 0));
  }

  tone(880, 0.22);
  silence(0.08);
  tone(1175, 0.22);
  silence(0.08);
  tone(880, 0.28);

  final data = ByteData(44 + samples.length * 2);
  void writeString(int offset, String value) {
    for (var i = 0; i < value.length; i++) {
      data.setUint8(offset + i, value.codeUnitAt(i));
    }
  }

  writeString(0, 'RIFF');
  data.setUint32(4, 36 + samples.length * 2, Endian.little);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  data.setUint32(16, 16, Endian.little);
  data.setUint16(20, 1, Endian.little);
  data.setUint16(22, 1, Endian.little);
  data.setUint32(24, sampleRate, Endian.little);
  data.setUint32(28, sampleRate * 2, Endian.little);
  data.setUint16(32, 2, Endian.little);
  data.setUint16(34, 16, Endian.little);
  writeString(36, 'data');
  data.setUint32(40, samples.length * 2, Endian.little);
  for (var i = 0; i < samples.length; i++) {
    data.setInt16(44 + i * 2, samples[i], Endian.little);
  }
  return data.buffer.asUint8List();
}
