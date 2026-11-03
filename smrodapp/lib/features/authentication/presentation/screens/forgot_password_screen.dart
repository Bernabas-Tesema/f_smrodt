import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../viewmodels/auth_viewmodel.dart';

/// Forgot-password screen. Same frame as sign-in.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  String? _notice;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final error = await ref.read(authViewModelProvider.notifier).forgotPassword(_email.text);
    if (!mounted) return;
    setState(() {
      _notice = error ?? 'If this email has an account, you can sign in with your password.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authViewModelProvider);
    final failed = _notice != null && auth.error != null;
    return BrandedPage(
      onBack: () => context.pop(),
      centered: true,
      title: 'Reset password',
      subtitle: 'Enter the email on your owner account.',
      children: [
        Form(
          key: _formKey,
          child: BrandedField(
            label: 'Email or Phone',
            child: TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: brandedInput(hint: 'user@example.com', icon: Icons.alternate_email),
              validator: Validators.email,
            ),
          ),
        ),
        if (_notice != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(_notice!, style: TextStyle(color: failed ? AppColors.red : AppColors.greenDark)),
          ),
        BrandedButton(label: 'Send reset', onPressed: _submit, loading: auth.loading),
      ],
    );
  }
}
