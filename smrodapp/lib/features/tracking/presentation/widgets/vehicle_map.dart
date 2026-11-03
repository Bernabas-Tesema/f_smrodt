import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../geofence/domain/entities/geofence.dart';
import '../../domain/entities/vehicle_location.dart';

enum MapTileStyle { navigationDay, satelliteStreets, cartoVoyager }

/// Enhanced Vehicle map widget with real Mapbox & CartoDB tiles, heading rotation, and pulse animations.
class VehicleMap extends StatefulWidget {
  const VehicleMap({
    super.key,
    required this.current,
    required this.history,
    required this.zones,
    this.immobilized = false,
  });

  final VehicleLocation? current;
  final List<VehicleLocation> history;
  final List<Geofence> zones;
  final bool immobilized;

  static const String mapboxToken =
      'pk.eyJ1IjoiYmVybmFiYXN0ZXNlbWEiLCJhIjoiY213MGVmNnVzMDIzYjJ4czlrODRoazU4bSJ9.BUNGJC6Zw4xQAg_ud_rM3g';

  @override
  State<VehicleMap> createState() => _VehicleMapState();
}

class _VehicleMapState extends State<VehicleMap> with SingleTickerProviderStateMixin {
  final MapController _controller = MapController();
  MapTileStyle _tileStyle = MapTileStyle.navigationDay;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.45).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(VehicleMap oldWidget) {
    super.didUpdateWidget(oldWidget);
    final current = widget.current;
    final previous = oldWidget.current;
    if (current == null || previous == null) return;
    final moved = (current.latitude - previous.latitude).abs() > 0.00001 ||
        (current.longitude - previous.longitude).abs() > 0.00001;
    if (!moved) return;
    final point = LatLng(current.latitude, current.longitude);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      try {
        _controller.move(point, _controller.camera.zoom);
      } catch (_) {}
    });
  }

  String _getTileUrl() {
    switch (_tileStyle) {
      case MapTileStyle.navigationDay:
        return 'https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/{z}/{x}/{y}@2x?access_token=${VehicleMap.mapboxToken}';
      case MapTileStyle.satelliteStreets:
        return 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${VehicleMap.mapboxToken}';
      case MapTileStyle.cartoVoyager:
        return 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';
    }
  }

  @override
  Widget build(BuildContext context) {
    final current = widget.current;
    final point = current == null
        ? const LatLng(9.03, 38.74)
        : LatLng(current.latitude, current.longitude);
    final trail = widget.history.map((item) => LatLng(item.latitude, item.longitude)).toList();

    return Stack(
      children: [
        FlutterMap(
          mapController: _controller,
          options: MapOptions(
            initialCenter: point,
            initialZoom: 15,
            minZoom: 4,
            maxZoom: 19,
          ),
          children: [
            TileLayer(
              urlTemplate: _getTileUrl(),
              userAgentPackageName: 'com.smrod.vehicle',
              tileDimension: 256,
              retinaMode: true,
            ),
            CircleLayer(
              circles: [
                for (final zone in widget.zones)
                  if (zone.active)
                    CircleMarker(
                      point: LatLng(zone.centerLat, zone.centerLng),
                      radius: zone.radiusMeters,
                      useRadiusInMeter: true,
                      color: AppColors.green.withValues(alpha: 0.16),
                      borderColor: AppColors.green,
                      borderStrokeWidth: 2.5,
                    ),
              ],
            ),
            if (trail.length > 1)
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: trail,
                    strokeWidth: 4.5,
                    color: AppColors.red.withValues(alpha: 0.85),
                  ),
                ],
              ),
            MarkerLayer(
              markers: [
                Marker(
                  point: point,
                  width: 58,
                  height: 58,
                  child: AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Stack(
                        alignment: Alignment.center,
                        children: [
                          // Animated Sonar Aura Ripple
                          Transform.scale(
                            scale: _pulseAnimation.value,
                            child: Opacity(
                              opacity: (1.0 - _pulseController.value).clamp(0.0, 1.0),
                              child: Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: (widget.immobilized ? AppColors.green : AppColors.red)
                                      .withValues(alpha: 0.4),
                                ),
                              ),
                            ),
                          ),
                          // Core Vehicle Marker Badge
                          DecoratedBox(
                            decoration: BoxDecoration(
                              color: widget.immobilized ? AppColors.green : AppColors.red,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 3),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x33000000),
                                  blurRadius: 8,
                                  offset: Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(9),
                              child: Icon(
                                widget.immobilized ? Icons.lock : Icons.directions_car_filled,
                                color: Colors.white,
                                size: 22,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),

        // Map Tile Style Switcher Overlay
        Positioned(
          top: 12,
          right: 12,
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.92),
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x18000000),
                  blurRadius: 10,
                  offset: Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _tileButton('Nav', MapTileStyle.navigationDay),
                _tileButton('Sat', MapTileStyle.satelliteStreets),
                _tileButton('Voyager', MapTileStyle.cartoVoyager),
              ],
            ),
          ),
        ),

        // Recenter GPS Button
        Positioned(
          bottom: 12,
          right: 12,
          child: FloatingActionButton.small(
            backgroundColor: Colors.white,
            foregroundColor: AppColors.ink,
            elevation: 3,
            onPressed: () {
              _controller.move(point, 16);
            },
            child: const Icon(Icons.my_location, size: 20),
          ),
        ),
      ],
    );
  }

  Widget _tileButton(String label, MapTileStyle style) {
    final active = _tileStyle == style;
    return InkWell(
      onTap: () => setState(() => _tileStyle = style),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.greenDark : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: active ? FontWeight.w800 : FontWeight.w600,
            color: active ? Colors.white : AppColors.ink,
          ),
        ),
      ),
    );
  }
}
