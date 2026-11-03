import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:smrod_vehicle_app/app/app.dart';
import 'package:smrod_vehicle_app/core/constants/app_constants.dart';

void main() {
  testWidgets('pilot owner signs in and sees the vehicle dashboard', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const ProviderScope(child: SmrodApp()));
    await tester.pump();

    expect(find.text('Skip'), findsOneWidget);
    await tester.tap(find.text('Skip'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Login'), findsOneWidget);
    await tester.enterText(find.byType(TextFormField).at(0), AppConstants.demoEmail);
    await tester.enterText(find.byType(TextFormField).at(1), AppConstants.demoPassword);
    await tester.ensureVisible(find.text('Login'));
    await tester.tap(find.text('Login'));
    await tester.pump();
    await tester.pump(const Duration(seconds: 2));

    final context = tester.element(find.byType(Scaffold).first);
    expect(GoRouter.of(context).state.uri.toString(), '/dashboard');
    expect(find.text('PROTECTED', skipOffstage: false), findsWidgets);
    expect(find.text('Need Help?', skipOffstage: false), findsWidgets);
    expect(find.text('Quick actions', skipOffstage: false), findsWidgets);
  });
}
