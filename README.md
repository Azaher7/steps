# Stride

Stride is a private, local-first step and walk tracker for Expo. It pairs the device pedometer with opt-in GPS recording and presents both in a polished, accessible dashboard. No account or backend is required.

## Highlights

- Daily step progress, estimated distance, calories, active minutes, and goal streak
- Foreground GPS walk recording with a live map, time, distance, pace, pause/resume, and summary
- Seven-day activity chart plus walk and daily history
- Configurable goal, metric/imperial units, light/dark/system appearance, and walk preferences
- First-launch explanation, contextual permission requests, denied/unavailable states, pull-to-refresh, persistence errors, and empty states
- Local persistence with AsyncStorage; health data is never uploaded

## Getting started

### Requirements

- Node.js 20 or newer
- Xcode 16+ and an iOS simulator/device, or Android Studio and an emulator/device
- Expo Go for quick UI development, or an Expo development build for device testing

```bash
npm install
npx expo start
```

Press `i` for iOS, `a` for Android, or scan the QR code using Expo Go. A **physical device is strongly recommended**: simulators generally do not provide real pedometer motion and cannot reproduce a real walk. Use Expo's location simulation only for map-flow development.

Useful checks:

```bash
npm test
npm run typecheck
npm run lint
```

For a native development build:

```bash
npx expo run:ios
npx expo run:android
```

Before cloud builds, replace the placeholder bundle/package identifiers and EAS project ID in `app.json`, then run `eas build:configure`.

## Permissions

| Capability | When requested | Why |
| --- | --- | --- |
| Motion & Fitness / Activity Recognition | After onboarding, when the dashboard mounts | Reads today's device step count |
| Precise location while in use | Only after **Start Walk** | Records route, distance, and pace for an intentional walk |

Stride requests foreground location only. It does not record in the background, and ending or leaving a walk stops the location subscription. On denial, the relevant screen explains how to recover; step denial does not prevent GPS walks, and location denial does not prevent dashboard use.

## Architecture

```text
.
├── App.tsx                         # App shell, theme, tabs, walk presentation
├── app.json                       # Expo/native permissions and identifiers
├── src/
│   ├── __tests__/calculations.test.ts
│   ├── components/
│   │   ├── UI.tsx                 # Cards, buttons, ring, metrics, states
│   │   └── WeeklyChart.tsx
│   ├── context/AppContext.tsx     # In-memory state and persistence actions
│   ├── data/storage.ts            # Versioned AsyncStorage boundary
│   ├── hooks/usePedometer.ts      # Permission, historical steps, live updates
│   ├── screens/
│   │   ├── HistoryScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── WalkScreen.tsx         # GPS lifecycle and session summary
│   ├── theme.ts                   # Semantic light/dark palettes
│   ├── types.ts                   # Stored domain models
│   └── utils/calculations.ts      # Distance, pace, streak, formatting
└── package.json
```

UI consumes a small typed app context, while device APIs and pure calculations remain separate. State is hydrated before the product UI appears and is saved after each mutation. The storage key is versioned to make a future migration explicit.

## Platform limitations

- Expo Pedometer uses the native platform motion service. Availability and historical retention vary by OS/device; simulators normally report unavailable or zero steps.
- The app estimates distance from steps using a fixed average stride and calories using a broad per-step estimate. These are wellness estimates, not medical measurements. GPS-recorded walks use route distance instead.
- GPS accuracy varies with signal, battery settings, and environment. Low-quality points (reported accuracy of 50 m or worse) are excluded when a walk begins.
- This MVP records only while the app is in the foreground. Background recording requires additional native configuration, user messaging, battery testing, and store review justification.
- Activity is local to one installation. Removing the app clears history; there is no sync, backup, or account recovery in this MVP.
- Android vendors may restrict motion sensors or location differently. Validate the target-device matrix before release.

## Before App Store / Play release

1. Replace `com.example.stride` identifiers and the placeholder EAS project ID; add final icons, splash assets, signing, store metadata, support URL, and privacy-policy URL.
2. Test permission upgrades/denials, cold starts, interruptions, low-power mode, inaccurate GPS, midnight rollover, daylight-saving changes, and long walks on supported physical devices.
3. Add crash reporting and privacy-respecting product analytics only after consent and legal review; define data retention and deletion behavior.
4. Validate accessibility with VoiceOver/TalkBack, Dynamic Type, reduced motion, contrast, and large text; localize UI and permission strings for launch markets.
5. Have health/calorie language and privacy disclosures reviewed. Complete Apple's privacy manifest/questionnaire and Google Play Data Safety declaration.
6. Add production E2E/device tests, persistence migrations, background/termination recovery if required, and CI gates for tests, lint, and type checking.
7. Tune GPS sampling against real battery use and decide whether foreground-only recording meets the final product promise.

## Privacy

Stride stores activity and routes in AsyncStorage on the device. This is suitable for an MVP but is not encrypted storage. Do not add sensitive profile fields without a deliberate threat model and secure-storage strategy.
