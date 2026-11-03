import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/utils/validators.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../viewmodels/vehicle_viewmodel.dart';

/// Vehicle pairing screen. Same frame as sign-in.
class VehiclePairingScreen extends ConsumerStatefulWidget {
  const VehiclePairingScreen({super.key});

  @override
  ConsumerState<VehiclePairingScreen> createState() => _VehiclePairingScreenState();
}

class _VehiclePairingScreenState extends ConsumerState<VehiclePairingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _serial = TextEditingController();
  final _make = TextEditingController();
  final _model = TextEditingController();
  final _plate = TextEditingController();

  @override
  void dispose() {
    _serial.dispose();
    _make.dispose();
    _model.dispose();
    _plate.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(vehicleViewModelProvider.notifier).pair(
      serialNo: _serial.text,
      make: _make.text,
      model: _model.text,
      plateNo: _plate.text,
    );
    if (!mounted) return;
    if (ok) {
      context.go('/dashboard');
    } else {
      final error = ref.read(vehicleViewModelProvider).error;
      if (error != null) context.showMessage(error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleViewModelProvider);
    return BrandedPage(
      title: 'Pair vehicle',
      subtitle: 'Enter the device serial, then the vehicle it protects.',
      children: [
        Form(
          key: _formKey,
          child: Column(
            children: [
              BrandedField(
                label: 'Device serial',
                child: TextFormField(
                  controller: _serial,
                  textCapitalization: TextCapitalization.characters,
                  decoration: brandedInput(hint: 'SMROD-001', icon: Icons.memory),
                  validator: (value) => Validators.requiredField(value, 'the device serial'),
                ),
              ),
              BrandedField(
                label: 'Make',
                child: TextFormField(
                  controller: _make,
                  textCapitalization: TextCapitalization.words,
                  decoration: brandedInput(hint: 'Toyota', icon: Icons.directions_car_outlined),
                  validator: (value) => Validators.requiredField(value, 'the make'),
                ),
              ),
              BrandedField(
                label: 'Model',
                child: TextFormField(
                  controller: _model,
                  textCapitalization: TextCapitalization.words,
                  decoration: brandedInput(hint: 'Land Cruiser', icon: Icons.directions_car_filled_outlined),
                  validator: (value) => Validators.requiredField(value, 'the model'),
                ),
              ),
              BrandedField(
                label: 'Plate number',
                child: TextFormField(
                  controller: _plate,
                  textCapitalization: TextCapitalization.characters,
                  decoration: brandedInput(hint: 'AA-3-4821', icon: Icons.pin_outlined),
                  validator: (value) => Validators.requiredField(value, 'the plate'),
                ),
              ),
            ],
          ),
        ),
        BrandedButton(label: 'Pair device', onPressed: _submit, loading: state.loading),
      ],
    );
  }
}
