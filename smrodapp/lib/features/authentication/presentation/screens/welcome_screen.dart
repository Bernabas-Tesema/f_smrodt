import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';

/// Three-step introduction. Skip or Get Started opens the login screen.
class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final _controller = PageController();
  int _index = 0;

  static const _pages = [
    _IntroPage(
      kicker: 'Vehicle Safety',
      title: 'Stay Protected',
      body:
          'Get instant alerts about movement, tampering, and unusual activity around your vehicle.',
      art: _Art.shield,
    ),
    _IntroPage(
      kicker: 'Live Tracking',
      title: 'Know Where It Is',
      body:
          'See your vehicle location, journey history, speed, and status whenever you need it.',
      art: _Art.map,
    ),
    _IntroPage(
      kicker: 'Remote Control',
      title: 'Stay in Control',
      body:
          'Manage security, geofences, emergency actions, and vehicle controls from one simple app.',
      art: _Art.safety,
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_index == _pages.length - 1) {
      context.go('/login');
      return;
    }
    _controller.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final last = _index == _pages.length - 1;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(0, 0, 0, 20),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text(
                      'Skip',
                      style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  itemCount: _pages.length,
                  onPageChanged: (value) => setState(() => _index = value),
                  itemBuilder: (context, index) => _pages[index],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 0; i < _pages.length; i++)
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: i == _index ? 22 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: i == _index ? AppColors.primary : const Color(0xFFC5D2DC),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 22),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: FilledButton(
                    onPressed: _next,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.red,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    ),
                    child: Text(
                      last ? 'Get Started' : 'Continue',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

enum _Art { shield, map, safety }

class _IntroPage extends StatelessWidget {
  const _IntroPage({
    required this.kicker,
    required this.title,
    required this.body,
    required this.art,
  });

  final String kicker;
  final String title;
  final String body;
  final _Art art;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final shortest = constraints.maxWidth < constraints.maxHeight
                  ? constraints.maxWidth
                  : constraints.maxHeight;
              final size = (shortest * 0.92).clamp(260.0, 380.0);
              return Center(
                child: SizedBox(
                  width: size,
                  height: size,
                  child: FittedBox(
                    fit: BoxFit.contain,
                    child: _Illustration(art: art),
                  ),
                ),
              );
            },
          ),
        ),
        SizedBox(
          height: 64,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                kicker,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 28,
                  height: 1.1,
                  fontWeight: FontWeight.w800,
                  color: AppColors.ink,
                ),
              ),
              Text(
                title,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 28,
                  height: 1.15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.tide,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 68,
          child: Center(
            child: Text(
              body,
              textAlign: TextAlign.center,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                height: 1.45,
                color: AppColors.muted,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _Illustration extends StatelessWidget {
  const _Illustration({required this.art});

  final _Art art;

  static const frameSize = 340.0;
  static const circleSize = 312.0;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: frameSize,
      height: frameSize,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: circleSize,
            height: circleSize,
            decoration: const BoxDecoration(
              color: AppColors.paper,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(color: Color(0x1A141816), blurRadius: 36, offset: Offset(0, 18)),
              ],
            ),
          ),
          switch (art) {
            _Art.shield => const _ShieldArt(),
            _Art.map => const _MapArt(),
            _Art.safety => const _SafetyArt(),
          },
          const Positioned(top: 48, right: 18, child: _ProtectedChip()),
        ],
      ),
    );
  }
}

class _ProtectedChip extends StatelessWidget {
  const _ProtectedChip();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, size: 8, color: AppColors.green),
          SizedBox(width: 6),
          Text(
            'Protected',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _ShieldArt extends StatefulWidget {
  const _ShieldArt();

  @override
  State<_ShieldArt> createState() => _ShieldArtState();
}

class _ShieldArtState extends State<_ShieldArt>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _pulse;
  late final Animation<double> _float;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);

    _pulse = Tween<double>(begin: 0.95, end: 1.06).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _float = Tween<double>(begin: -6.0, end: 6.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Ambient glowing pulse ring behind shield
            Transform.scale(
              scale: _pulse.value * 1.15,
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.red.withValues(alpha: 0.08),
                ),
              ),
            ),
            Transform.scale(
              scale: _pulse.value,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.green.withValues(alpha: 0.12),
                ),
              ),
            ),
            // Floating Shield & Car
            Transform.translate(
              offset: Offset(0, _float.value),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.verified_user,
                    size: 96,
                    color: AppColors.red,
                    shadows: [
                      BoxShadow(
                        color: AppColors.red.withValues(alpha: 0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Transform.scale(
                    scale: 2.0 - _pulse.value,
                    child: const Icon(
                      Icons.directions_car_filled,
                      size: 50,
                      color: AppColors.greenDark,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _MapArt extends StatefulWidget {
  const _MapArt();

  @override
  State<_MapArt> createState() => _MapArtState();
}

class _MapArtState extends State<_MapArt>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _bounce;
  late final Animation<double> _radar;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();

    _bounce = Tween<double>(begin: 0.0, end: -12.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeInOut),
      ),
    );
    _radar = Tween<double>(begin: 0.4, end: 1.4).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutQuad,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 130,
          height: 190,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.ink, width: 3),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Radar sonar pulse ring beneath pin
              Positioned(
                top: 75,
                child: Opacity(
                  opacity: (1.0 - _controller.value).clamp(0.0, 1.0),
                  child: Container(
                    width: 60 * _radar.value,
                    height: 30 * _radar.value,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.red.withValues(alpha: 0.8),
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ),
              Column(
                children: [
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.green.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'Live GNSS',
                      style: TextStyle(
                        color: AppColors.greenDark,
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                      ),
                    ),
                  ),
                  const Spacer(),
                  // Bouncing GPS Location Marker
                  Transform.translate(
                    offset: Offset(0, _bounce.value),
                    child: Icon(
                      Icons.place,
                      color: AppColors.red,
                      size: 48,
                      shadows: [
                        BoxShadow(
                          color: AppColors.red.withValues(alpha: 0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Rotating tracking radar globe
                  Transform.rotate(
                    angle: _controller.value * 2 * 3.14159,
                    child: const Icon(
                      Icons.travel_explore,
                      color: AppColors.green,
                      size: 38,
                    ),
                  ),
                  const SizedBox(height: 14),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SafetyArt extends StatefulWidget {
  const _SafetyArt();

  @override
  State<_SafetyArt> createState() => _SafetyArtState();
}

class _SafetyArtState extends State<_SafetyArt>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _signalWave;
  late final Animation<double> _carGlide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _signalWave = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _carGlide = Tween<double>(begin: -4.0, end: 4.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Remote Key / Controller with animated transmission waves
            Transform.scale(
              scale: _signalWave.value,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.red.withValues(alpha: 0.1),
                    ),
                  ),
                  const Icon(
                    Icons.portable_wifi_off,
                    size: 40,
                    color: AppColors.red,
                  ),
                  Positioned(
                    top: 2,
                    right: 4,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: AppColors.green,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Floating Connected Vehicle with security shield glow
            Transform.translate(
              offset: Offset(0, _carGlide.value),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.green.withValues(alpha: 0.1),
                    ),
                  ),
                  const Icon(
                    Icons.directions_car,
                    size: 82,
                    color: AppColors.green,
                  ),
                  const Positioned(
                    bottom: 12,
                    right: 12,
                    child: Icon(
                      Icons.lock,
                      size: 24,
                      color: AppColors.red,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
