# Stride

<<<<<<< ours
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
=======
Stride is a privacy-conscious, local-first Expo step and GPS walk tracker. Tracking works without an account or network. An optional Supabase account adds backup and cross-device restoration after a walk is completed.

## What is real (and what is not)

There is **no demo movement or sample health data in production code**.

- **Steps:** `expo-sensors` Pedometer checks native availability, requests Motion/Activity Recognition permission, reads the real count from local midnight, then adds live native sensor updates. Unsupported devices show an explicit unavailable state rather than invented steps.
- **Walks:** `expo-location` obtains a real high-accuracy starting fix and streams device coordinates. Points with accuracy worse than 50 m, non-monotonic timestamps, or apparent speed over 8 m/s are rejected. Route distance is the sum of accepted Haversine segments.
- **Background:** `expo-task-manager` and `Location.startLocationUpdatesAsync` append accepted coordinates to the persisted active session. An Android foreground-service notification remains visible. Background access is optional and requested only when the user enables the preference and begins a walk.
- **Recovery:** the active session, route, accumulated active time, status, and last GPS signal time are written to AsyncStorage. On relaunch, Stride reopens it instead of silently losing it.

The original MVP already used real `watchPositionAsync` coordinates and a real pedometer—it was not mocked—but it was only a fragile foreground implementation: it did not acquire/validate an initial fix, survive process restart, register a background task, filter GPS jumps comprehensively, or restore an active session.

## Requirements

- Node.js 20+
- Xcode 16+ for iOS or Android Studio for Android
- Expo/EAS account for development builds
- A physical phone for sensor validation
- Optional Supabase project for accounts/sync

```bash
npm install
cp .env.example .env
npm run typecheck
npm test
npm run lint
```

## Development builds (recommended)

Expo Go is useful for basic UI work, but it is **not the supported validation environment** for Stride background location, Android foreground services, native permission configuration, or reliable pedometer testing. Use a development client on a real phone.

First replace `REPLACE_WITH_EAS_PROJECT_ID` in `app.json` by running:

```bash
npm install --global eas-cli
eas login
eas init
eas build:configure
```

Then build installable development clients:

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

The Android development profile emits an APK for direct installation. The iOS profile requires a paid Apple Developer account and device registration for internal distribution. After installing, run `npm start` and open the development client.

Local native builds are also available:

```bash
npm run ios
npm run android
```

## Permissions

| Capability | When | Purpose |
| --- | --- | --- |
| Motion & Fitness / Activity Recognition | Dashboard after onboarding | Real daily step count |
| Foreground precise location | User taps Begin Walk | Initial fix, live route, distance, pace |
| Background location (optional) | Begin Walk, only if enabled in Settings | Continue the active walk while locked/backgrounded |
| Android foreground service | During background-enabled active walk | Required persistent recording notification |

Pausing, finishing, or discarding stops location updates. GPS-disabled, weak-signal, denied, and stale-signal states are visible; Stride never fakes progress. iOS may pause/terminate apps under system pressure despite configuration. Android OEM battery optimization can interrupt services. Real-device testing across target OS/OEM versions remains mandatory.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase link --project-ref <ref>` and `supabase db push`, or paste `supabase/migrations/202609220001_initial_schema.sql` into the SQL editor.
3. Set Authentication > URL Configuration redirect URL to `stride://reset-password`.
4. Enable Email authentication. Decide whether email confirmation is required; configure production SMTP before beta scale.
5. Copy `.env.example` to `.env` and provide only client-safe values:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ANDROID_RESTRICTED_GOOGLE_MAPS_KEY
```

Never place a service-role key in the app or an `EXPO_PUBLIC_` variable. `.env*` is ignored except `.env.example`.

For Android maps, enable **Maps SDK for Android** in Google Cloud and restrict the key to `com.stridehealth.walktracker` plus the SHA-1 certificates for the EAS development and production credentials. `app.config.ts` injects it only into native Android configuration. iOS uses Apple Maps by default.

### Cloud architecture

Local tracking and persistence do not import or depend on Supabase. Once authenticated and online, a debounced sync layer first restores remote records and merges them by stable ID / `updated_at`, preserving the newer item. It then upserts unsynced completed walks and daily summaries plus preferences. Active points are never streamed to the backend; a completed route is uploaded once as a JSONB array.

The migration creates:

- `profiles` — one row per auth user
- `walk_sessions` — summary plus compact JSONB route, indexed by user/start time
- `daily_activity` — one summary per user/calendar date
- `user_preferences` — goal, units, and theme

All tables enable RLS. Every policy requires `auth.uid()` ownership. Foreign keys cascade on account deletion. The authenticated-only `delete_own_account()` RPC deletes the caller'\''s auth record, which cascades all cloud data. No service-role credential is exposed.
>>>>>>> theirs

## Architecture

```text
<<<<<<< ours
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
=======
App.tsx                         providers, tabs, overlays, active-walk restore
src/components/                themed reusable UI and charts
src/context/                   app/local state and optional auth session
src/data/storage.ts            versioned app and active-session persistence
src/hooks/                     native pedometer and offline-aware cloud sync
src/screens/                   dashboard, history, walk, settings, auth/privacy
src/services/walkTracking.ts   GPS quality gate and background task
src/services/supabase.ts       client-safe optional cloud client
src/services/sync.ts           pull/merge/upsert sync boundary
src/utils/calculations.ts      pure route, pace, streak, aggregation logic
supabase/migrations/           reproducible schema, indexes, RLS, deletion RPC
docs/PRIVACY_POLICY_TEMPLATE.md adaptable pre-release disclosure draft
```

## Release checklist

### Before TestFlight

- Replace placeholder EAS project ID and verify final Apple bundle ID ownership.
- Supply Apple credentials, register test devices, create App Store Connect record, final icons/screenshots/support and privacy-policy URLs.
- Complete App Privacy responses (precise location, fitness/activity, identifiers if accounts are enabled) based on the final build.
- Configure Supabase production SMTP and redirect links; adapt and legally review the privacy template.
- Test permission changes, lock/background, force quit, phone calls, long sessions, midnight/DST, weak GPS, offline sync, deletion, and battery impact on supported physical iPhones.
- Build `eas build --platform ios --profile production`, upload to TestFlight, complete export compliance, and invite testers. No submission is performed by this repository.

### Before Google Play internal testing

- Confirm ownership of `com.stridehealth.walktracker`, create the Play Console app, and provide signing/service credentials to EAS.
- Complete Data Safety and background-location declarations. Google may require a video and prominent disclosure before background-location approval.
- Run the same device matrix, emphasizing Android 11+ background permission routing, Android 13+ foreground-service behavior, OEM battery restrictions, and sensor availability.
- Build `eas build --platform android --profile production` (AAB), upload it to an internal track, and add testers.

## Known limitations

- Step history/availability differs by hardware and OS. Simulators usually return unavailable or zero; physical development builds are required.
- Daily distance/calories are broad wellness estimates based on fixed stride/per-step constants, not medical measurements. GPS walk distance uses accepted coordinates.
- Background tracking cannot guarantee survival after a user force-quits the app; platform policies intentionally restrict that behavior.
- Routes are JSONB for MVP simplicity. For very long sessions or spatial queries, add encoded polylines/PostGIS or a paged route-point table.
- Sync is last-updated-wins per record and intentionally lightweight; there is no real-time collaboration.
- AsyncStorage is not encrypted. Authentication tokens use Supabase'\''s supported React Native persistence, but a future high-risk threat model may require platform secure storage.
- Physical GPS, pedometer, lock-screen background behavior, and store review have **not** been verified in this container and must be validated by the project owner on real iOS and Android devices.
>>>>>>> theirs
