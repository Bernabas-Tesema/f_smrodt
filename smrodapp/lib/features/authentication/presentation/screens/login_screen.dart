import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../viewmodels/auth_viewmodel.dart';

/// Login screen.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authViewModelProvider.notifier).login(_email.text, _password.text);
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authViewModelProvider);
    return BrandedPage(
      title: 'Welcome Back',
      subtitle: 'Secure access to your vehicle dashboard.',
      children: [
        Form(
          key: _formKey,
          child: Column(
            children: [
              BrandedField(
                label: 'Email or Phone',
                child: TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: brandedInput(hint: 'user@example.com', icon: Icons.alternate_email),
                  validator: Validators.email,
                ),
              ),
              BrandedField(
                label: 'Password',
                child: TextFormField(
                  controller: _password,
                  obscureText: _obscure,
                  decoration: brandedInput(
                    hint: '••••••••',
                    icon: Icons.lock_outline,
                    suffix: IconButton(
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppColors.muted),
                    ),
                  ),
                  validator: Validators.password,
                ),
              ),
            ],
          ),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(
            onPressed: () => context.push('/forgot-password'),
            child: const Text('Forgot Password?', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w700)),
          ),
        ),
        if (auth.error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(auth.error!, style: const TextStyle(color: AppColors.red)),
          ),
        BrandedButton(label: 'Login', onPressed: _submit, loading: auth.loading),
        const SizedBox(height: 18),
        const Row(
          children: [
            Expanded(child: Divider()),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text('or', style: TextStyle(color: AppColors.muted)),
            ),
            Expanded(child: Divider()),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _SocialCircle(
              onPressed: auth.loading ? null : () => ref.read(authViewModelProvider.notifier).loginWithProvider('google'),
              child: const Text('G', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.red)),
            ),
            const SizedBox(width: 16),
            _SocialCircle(
              onPressed: auth.loading ? null : () => ref.read(authViewModelProvider.notifier).loginWithProvider('apple'),
              child: const Icon(Icons.apple, color: AppColors.ink),
            ),
          ],
        ),
        const SizedBox(height: 22),
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            const Text("Don't have an account? ", style: TextStyle(color: AppColors.muted)),
            GestureDetector(
              onTap: () => context.push('/register'),
              child: const Text('Sign up', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ],
    );
  }
}

class _SocialCircle extends StatelessWidget {
  const _SocialCircle({required this.child, required this.onPressed});

  final Widget child;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(side: BorderSide(color: AppColors.line)),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onPressed,
        child: SizedBox(width: 52, height: 52, child: Center(child: child)),
      ),
    );
  }
}
