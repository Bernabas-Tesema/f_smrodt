import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../app/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../shared/extensions/context_extensions.dart';
import '../../../../shared/widgets/brand_backdrop.dart';

/// Owner customer support: call, email, WhatsApp, FAQ, and a message form.
class CustomerSupportScreen extends StatefulWidget {
  const CustomerSupportScreen({super.key});

  @override
  State<CustomerSupportScreen> createState() => _CustomerSupportScreenState();
}

class _CustomerSupportScreenState extends State<CustomerSupportScreen> {
  final _messageController = TextEditingController();
  final _subjectController = TextEditingController();
  bool _sending = false;

  static const _faqs = [
    (
      q: 'How do I pair my VSCU device?',
      a: 'Open Pair Vehicle, enter the device serial on the sticker under the dash unit, and confirm ownership. Keep Bluetooth/location on during pairing.',
    ),
    (
      q: 'What does the AI risk score mean?',
      a: 'It is a 0–100 security assessment from SMROD’s Django AI engine (theft, crash, and tamper signals). Critical scores mean review the vehicle immediately.',
    ),
    (
      q: 'Immobilize is blocked — why?',
      a: 'Remote immobilize only works when vehicle speed is at or below 5 km/h for safety. Wait until the car is nearly stopped, then retry with biometrics.',
    ),
    (
      q: 'I lost access after changing phones',
      a: 'Sign in with the same Google or email account. Biometric lock resets on the new phone; turn it back on under Profile.',
    ),
  ];

  @override
  void dispose() {
    _messageController.dispose();
    _subjectController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const CurveHeader(
              title: 'Customer support',
              subtitle: 'Call, email, WhatsApp, and questions.',
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: const LinearGradient(
                colors: [AppColors.primaryDark, AppColors.tide],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'VSCU-100 Support',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  AppConstants.supportHours,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
                ),
                const SizedBox(height: 10),
                Text(
                  'Vehicle security, pairing, AI alerts, and billing help.',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Contact us', style: AppTextStyles.title),
          const SizedBox(height: 10),
          Container(
            decoration: AppTheme.card,
            child: Column(
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x1A1A6B82),
                    child: Icon(Icons.phone_outlined, color: AppColors.tide),
                  ),
                  title: const Text('Call support'),
                  subtitle: Text(AppConstants.emergencyContact),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _launch('tel:${AppConstants.supportPhone}'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x1A163A5F),
                    child: Icon(Icons.mail_outline, color: AppColors.primary),
                  ),
                  title: const Text('Email'),
                  subtitle: Text(AppConstants.supportEmail),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _launch(
                    'mailto:${AppConstants.supportEmail}?subject=VSCU-100%20Support',
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0x1AC4A36A),
                    child: Icon(Icons.chat_outlined, color: AppColors.brass),
                  ),
                  title: const Text('WhatsApp'),
                  subtitle: const Text('Chat with an agent'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _launch(
                    'https://wa.me/${AppConstants.supportWhatsApp.replaceAll('+', '')}',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text('Send a message', style: AppTextStyles.title),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: AppTheme.card,
            child: Column(
              children: [
                TextField(
                  controller: _subjectController,
                  decoration: const InputDecoration(
                    labelText: 'Subject',
                    hintText: 'Pairing issue, AI alert, billing…',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _messageController,
                  minLines: 4,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    labelText: 'Message',
                    alignLabelWithHint: true,
                    hintText: 'Describe what happened and your plate number.',
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: _sending ? null : _sendMessage,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Send to support'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text('FAQ', style: AppTextStyles.title),
          const SizedBox(height: 10),
          ..._faqs.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                decoration: AppTheme.card,
                child: ExpansionTile(
                  tilePadding: const EdgeInsets.symmetric(horizontal: 14),
                  childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                  title: Text(item.q, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  children: [
                    Text(item.a, style: AppTextStyles.caption.copyWith(height: 1.4)),
                  ],
                ),
              ),
            ),
          ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) {
      context.showMessage('Could not open that link on this device.');
    }
  }

  Future<void> _sendMessage() async {
    final subject = _subjectController.text.trim();
    final body = _messageController.text.trim();
    if (subject.isEmpty || body.isEmpty) {
      context.showMessage('Add a subject and message first.');
      return;
    }
    setState(() => _sending = true);
    final mail = Uri(
      scheme: 'mailto',
      path: AppConstants.supportEmail,
      queryParameters: {
        'subject': 'VSCU-100 Support · $subject',
        'body': body,
      },
    );
    try {
      await launchUrl(mail);
      if (mounted) {
        _subjectController.clear();
        _messageController.clear();
        context.showMessage('Opening email to ${AppConstants.supportEmail}');
      }
    } catch (_) {
      await Clipboard.setData(
        ClipboardData(text: 'Subject: $subject\n\n$body'),
      );
      if (mounted) {
        context.showMessage('Copied your message. Paste it into an email to support.');
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }
}
