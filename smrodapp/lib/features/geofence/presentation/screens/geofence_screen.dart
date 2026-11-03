import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../tracking/presentation/viewmodels/tracking_viewmodel.dart';
import '../../../vehicle/presentation/viewmodels/vehicle_viewmodel.dart';
import '../../domain/entities/geofence.dart';
import '../viewmodels/geofence_viewmodel.dart';
import '../../../tracking/presentation/widgets/vehicle_map.dart';

/// Geofence screen.
class GeofenceScreen extends ConsumerStatefulWidget {
  const GeofenceScreen({super.key});

  @override
  ConsumerState<GeofenceScreen> createState() => _GeofenceScreenState();
}

class _GeofenceScreenState extends ConsumerState<GeofenceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  double _radius = 400;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(geofenceViewModelProvider.notifier).add(
      name: _name.text,
      radiusMeters: _radius,
    );
    if (!mounted) return;
    if (!ok) {
      final error = ref.read(geofenceViewModelProvider).error;
      if (error != null) context.showMessage(error);
      return;
    }
    _name.clear();
    context.showMessage('Zone saved around the current vehicle position.');
  }

  @override
  Widget build(BuildContext context) {
    final zones = ref.watch(geofenceViewModelProvider).zones;
    final tracking = ref.watch(trackingViewModelProvider);
    final immobilized = ref.watch(vehicleViewModelProvider).vehicle?.immobilized ?? false;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Geofence')),
      body: Stack(
        children: [
          const BrandBackdrop(),
          ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SizedBox(
            height: 220,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: VehicleMap(
                current: tracking.current,
                history: const [],
                zones: zones,
                immobilized: immobilized,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Zones', style: AppTextStyles.title),
          const SizedBox(height: 8),
          if (zones.isEmpty)
            const Text('No zones yet.', style: AppTextStyles.caption)
          else
            for (final zone in zones) _ZoneTile(zone: zone),
          const SizedBox(height: 16),
          const Text('New zone', style: AppTextStyles.title),
          const SizedBox(height: 8),
          Form(
            key: _formKey,
            child: BrandedField(
              label: 'Zone name',
              child: TextFormField(
                controller: _name,
                decoration: brandedInput(hint: 'Home', icon: Icons.radar),
                validator: (value) => Validators.requiredField(value, 'a name'),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text('Radius ${_radius.round()} m', style: AppTextStyles.caption),
          Slider(
            value: _radius,
            min: 100,
            max: 2000,
            divisions: 19,
            label: '${_radius.round()} m',
            onChanged: (value) => setState(() => _radius = value),
          ),
          BrandedButton(label: 'Save zone', onPressed: _add),
        ],
      ),
        ],
      ),
    );
  }
}

class _ZoneTile extends ConsumerWidget {
  const _ZoneTile({required this.zone});

  final Geofence zone;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: AppTheme.card,
      child: SwitchListTile(
        title: Text(zone.name),
        subtitle: Text('${zone.radiusMeters.round()} m · ${zone.polygon.length} points'),
        value: zone.active,
        onChanged: (_) => ref.read(geofenceViewModelProvider.notifier).toggle(zone.id),
      ),
    );
  }
}
