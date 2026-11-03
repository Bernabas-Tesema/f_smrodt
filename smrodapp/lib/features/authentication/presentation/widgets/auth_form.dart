import 'package:flutter/material.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/app_button.dart';

/// Shared authentication form.
class AuthForm extends StatelessWidget {
  const AuthForm({
    super.key,
    required this.formKey,
    required this.emailController,
    required this.passwordController,
    required this.submitLabel,
    required this.onSubmit,
    this.nameController,
    this.confirmController,
    this.loading = false,
    this.error,
    this.accent = AppColors.red,
    this.tone = AppButtonTone.primary,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController? nameController;
  final TextEditingController? confirmController;
  final String submitLabel;
  final VoidCallback onSubmit;
  final bool loading;
  final String? error;
  final Color accent;
  final AppButtonTone tone;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (nameController != null) ...[
            TextFormField(
              controller: nameController,
              textCapitalization: TextCapitalization.words,
              decoration: _decoration('Full name', Icons.badge_outlined, accent),
              validator: (value) => Validators.requiredField(value, 'your name'),
            ),
            const SizedBox(height: 12),
          ],
          TextFormField(
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const [AutofillHints.email],
            decoration: _decoration('Username', Icons.person_outline, accent),
            validator: Validators.email,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: passwordController,
            obscureText: true,
            autofillHints: const [AutofillHints.password],
            decoration: _decoration('Password', Icons.lock_outline, accent),
            validator: Validators.password,
          ),
          if (confirmController != null) ...[
            const SizedBox(height: 12),
            TextFormField(
              controller: confirmController,
              obscureText: true,
              decoration: _decoration('Confirm password', Icons.lock_outline, accent),
              validator: (value) => Validators.confirmPassword(value, passwordController.text),
            ),
          ],
          if (error != null) ...[
            const SizedBox(height: 12),
            Text(error!, style: AppTextStyles.caption.copyWith(color: AppColors.red)),
          ],
          const SizedBox(height: 18),
          AppButton(label: submitLabel, onPressed: onSubmit, loading: loading, tone: tone),
        ],
      ),
    );
  }

  InputDecoration _decoration(String label, IconData icon, Color accent) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: accent),
    );
  }
}
