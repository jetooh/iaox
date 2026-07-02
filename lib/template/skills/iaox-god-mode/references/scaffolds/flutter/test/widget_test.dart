import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:__APP_NAME__/main.dart';

void main() {
  testWidgets('counter increments when the button is tapped', (tester) async {
    await tester.pumpWidget(const App());

    expect(find.text('Você clicou 0 vez(es).'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    expect(find.text('Você clicou 1 vez(es).'), findsOneWidget);
  });
}
