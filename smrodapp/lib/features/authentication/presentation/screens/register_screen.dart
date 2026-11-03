import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../core/utils/validators.dart';
import '../../../../shared/widgets/brand_backdrop.dart';
import '../../../../shared/widgets/branded_page.dart';
import '../viewmodels/auth_viewmodel.dart';

/// Create-account screen. Same colors as sign-in, without a confirm-password field.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref.read(authViewModelProvider.notifier).register(
      name: _name.text,
      email: _email.text,
      password: _password.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authViewModelProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          const BrandBackdrop(),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
              children: [
                const Center(child: BrandLogoBadge()),
                const SizedBox(height: 28),
                const Text(
                  'Create Account',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.ink, letterSpacing: -0.6),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sign up to get started with your dashboard.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, height: 1.4, color: AppColors.muted),
                ),
                const SizedBox(height: 32),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      BrandedField(
                        label: 'Full Name',
                        child: TextFormField(
                          controller: _name,
                          textCapitalization: TextCapitalization.words,
                          decoration: brandedInput(hint: 'Enter your name', icon: Icons.person_outline),
                          validator: (value) => Validators.requiredField(value, 'your name'),
                        ),
                      ),
                      BrandedField(
                        label: 'Email',
                        child: TextFormField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          decoration: brandedInput(hint: 'Enter your email', icon: Icons.email_outlined),
                          validator: Validators.email,
                        ),
                      ),
                      BrandedField(
                        label: 'Password',
                        child: TextFormField(
                          controller: _password,
                          obscureText: _obscure,
                          decoration: brandedInput(
                            hint: 'Create a password',
                            icon: Icons.lock_outline,
                            suffix: IconButton(
                              onPressed: () => setState(() => _obscure = !_obscure),
                              icon: Icon(
                                _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                color: AppColors.muted,
                              ),
                            ),
                          ),
                          validator: Validators.password,
                        ),
                      ),
                    ],
                  ),
                ),
                if (auth.error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(auth.error!, style: const TextStyle(color: AppColors.red)),
                  ),
                BrandedButton(label: 'Create Account', onPressed: _submit, loading: auth.loading),
                const SizedBox(height: 22),
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text('Or', style: TextStyle(color: AppColors.muted)),
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
                    const Text('Already have an account? ', style: TextStyle(color: AppColors.muted)),
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: const Text('Sign In', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
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
