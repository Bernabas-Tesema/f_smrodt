import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/app.dart';
import 'core/alerts/voice_service.dart';
import 'core/constants/app_constants.dart';
import 'core/storage/local_storage_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Never fetch fonts from fonts.gstatic.com (often blocked offline / by network).
  GoogleFonts.config.allowRuntimeFetching = false;

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    publishableKey: AppConstants.supabaseAnonKey,
  );

  await LocalStorageService.instance.init();
  await VoiceService.instance.load();
  runApp(const ProviderScope(child: SmrodApp()));
}
