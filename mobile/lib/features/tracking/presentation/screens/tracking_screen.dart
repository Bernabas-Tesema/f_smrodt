import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/date_formatter.dart';
import '../../../../core/widgets/app_error_widget.dart';
import '../../../../shared/widgets/offline_banner.dart';
import '../../../geofence/presentation/viewmodels/geofence_viewmodel.dart';
import '../../../vehicle/presentation/viewmodels/vehicle_viewmodel.dart';
import '../viewmodels/tracking_viewmodel.dart';
import '../widgets/location_info_card.dart';
import '../widgets/vehicle_map.dart';

/// Tracking screen with a full map and a fixed top icon bar.
class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({super.key});

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen> {
  bool _fullMap = false;

  @override
  Widget build(BuildContext context) {
    final tracking = ref.watch(trackingViewModelProvider);
    final vehicle = ref.watch(vehicleViewModelProvider).vehicle;
    final zones = ref.watch(geofenceViewModelProvider).zones;
    final current = tracking.current;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: current == null
            ? Column(
                children: [
                  _TopBar(
                    fullMap: _fullMap,
                    onRefresh: () => ref.read(trackingViewModelProvider.notifier).refresh(),
                    onToggleFull: () => setState(() => _fullMap = !_fullMap),
                  ),
                  Expanded(
                    child: AppErrorWidget(
                      message: tracking.error ?? 'Location appears after the vehicle is paired.',
                      onRetry: () => ref.read(trackingViewModelProvider.notifier).refresh(),
                    ),
                  ),
                ],
              )
            : Column(
                children: [
                  _TopBar(
                    fullMap: _fullMap,
                    onRefresh: () => ref.read(trackingViewModelProvider.notifier).refresh(),
                    onToggleFull: () => setState(() => _fullMap = !_fullMap),
                  ),
                  if (vehicle?.online == false)
                    OfflineBanner(
                      message: 'Vehicle connection unavailable',
                      detail:
                          'Last updated ${DateFormatter.relative(current.timestamp)}. This is not a live position.',
                    ),
                  Expanded(
                    child: VehicleMap(
                      current: current,
                      history: tracking.history,
                      zones: zones,
                      immobilized: vehicle?.immobilized ?? false,
                    ),
                  ),
                  if (!_fullMap) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                      child: LocationInfoCard(
                        location: current,
                        cached: vehicle?.online == false,
                      ),
                    ),
                    SizedBox(
                      height: 132,
                      child: ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        scrollDirection: Axis.horizontal,
                        itemCount: tracking.history.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final point = tracking.history[index];
                          return Container(
                            width: 160,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFFE2E8E4)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(DateFormatter.relative(point.timestamp), style: AppTextStyles.caption),
                                const Spacer(),
                                Text('${point.speedKph.toStringAsFixed(0)} km/h', style: AppTextStyles.title),
                                Text(point.address, maxLines: 2, style: AppTextStyles.caption),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.fullMap,
    required this.onRefresh,
    required this.onToggleFull,
  });

  final bool fullMap;
  final VoidCallback onRefresh;
  final VoidCallback onToggleFull;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.paper,
      elevation: 0,
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: const BoxDecoration(
          color: AppColors.paper,
          border: Border(bottom: BorderSide(color: AppColors.line)),
        ),
        child: Row(
          children: [
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Live tracking',
                style: TextStyle(
                  color: AppColors.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            IconButton(
              tooltip: fullMap ? 'Show details' : 'Full map',
              onPressed: onToggleFull,
              icon: Icon(
                fullMap ? Icons.fullscreen_exit_rounded : Icons.fullscreen_rounded,
                color: AppColors.ink,
              ),
            ),
            IconButton(
              tooltip: 'Refresh',
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh_rounded, color: AppColors.ink),
            ),
          ],
        ),
      ),
    );
  }
}
