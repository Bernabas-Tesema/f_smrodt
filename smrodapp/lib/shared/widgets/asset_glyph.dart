import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Icon artwork with the photo background removed.
class AssetGlyph extends StatelessWidget {
  const AssetGlyph(
    this.asset, {
    super.key,
    this.size = 28,
    this.selected = false,
  });

  final String asset;
  final double size;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: selected ? 1 : 0.92,
      child: SizedBox(
        width: size,
        height: size,
        child: FutureBuilder<ui.Image>(
          future: cutoutAsset(asset),
          builder: (context, snapshot) {
            final image = snapshot.data;
            if (image == null) return const SizedBox.shrink();
            return RawImage(image: image, fit: BoxFit.contain);
          },
        ),
      ),
    );
  }
}

final _cutouts = <String, Future<ui.Image>>{};

Future<ui.Image> cutoutAsset(String asset) {
  return _cutouts.putIfAbsent(asset, () => _loadCutout(asset));
}

Future<ui.Image> _loadCutout(String asset) async {
  final data = await rootBundle.load(asset);
  final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
  final frame = await codec.getNextFrame();
  final source = frame.image;
  final raw = await source.toByteData(format: ui.ImageByteFormat.rawRgba);
  final bytes = Uint8List.fromList(raw!.buffer.asUint8List());
  _knockOutBackdrop(bytes, source.width, source.height);
  final completer = Completer<ui.Image>();
  ui.decodeImageFromPixels(
    bytes,
    source.width,
    source.height,
    ui.PixelFormat.rgba8888,
    completer.complete,
  );
  final image = await completer.future;
  source.dispose();
  return image;
}

/// Clears pale background pixels, and keeps the colored icon.
void _knockOutBackdrop(Uint8List bytes, int width, int height) {
  bool backdrop(int index) {
    final red = bytes[index];
    final green = bytes[index + 1];
    final blue = bytes[index + 2];
    final maxChannel = red > green ? (red > blue ? red : blue) : (green > blue ? green : blue);
    final minChannel = red < green ? (red < blue ? red : blue) : (green < blue ? green : blue);
    final saturation = maxChannel - minChannel;
    final luma = (red + green + blue) / 3;
    return luma > 176 && saturation < 58;
  }

  for (var pixel = 0; pixel < width * height; pixel++) {
    final index = pixel * 4;
    if (backdrop(index)) {
      bytes[index + 3] = 0;
    }
  }
}
