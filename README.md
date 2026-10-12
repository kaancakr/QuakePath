# QuakePath

An Expo / React Native app for earthquake emergencies. You can raise SOS alerts on a live Mapbox map, get a route to a safe assembly point, and keep messaging nearby phones over a Bluetooth Low Energy (BLE) mesh when the cellular network is down.

Project website: **https://kaancakr.github.io/quake-path/**

## Features

- **Live SOS map.** The dashboard shows your position on a Mapbox map, which switches between day and night styles with the app theme. **Send SOS** saves an emergency with your GPS coordinates to Cloud Firestore. Every emergency appears on everyone's map as a marker in real time. Opening one shows a live message thread for that alert and draws a line from you to it.
- **Routes to safe assembly points.** A swipe-up sheet lists safe assembly points that you can search. For now this is a fixed list of six sites in Çankaya, Ankara. Pick one and the app draws a driving route to it using the Mapbox Directions API.
- **Offline BLE mesh (Mesh screen).** Phones running QuakePath find each other through a custom BLE GATT service, connect automatically and exchange JSON messages. Each message has an ID, so a phone ignores copies it has already seen. It also has a hop limit (TTL 5), and phones pass it on to their other connected peers, so a message can reach phones outside direct Bluetooth range. The screen shows:
  - nearby devices with signal strength (RSSI) and the peers you are connected to
  - a chat that vibrates and shows a local notification when a message arrives
  - an emergency button that sends your location to all connected peers and also records the alert in Firestore
- **Location sync with mesh fallback.** Every 30 minutes, and whenever an emergency is sent from the Mesh screen, the app posts the device location to the backend API. If the API can't be reached, the location goes out over the mesh marked "needs forwarding". A peer that does have a connection uploads it. Failed uploads are queued and retried.
- **Civilian and rescue-team roles.** Users sign in to Firebase Authentication with email and password and choose a role at sign-up. The role is stored in Firestore. Rescue-team accounts see the latest synced civilian locations on the map, refreshed every 5 minutes.
- **Emergency screen.** Ready-made Turkish messages ("I need help", "I'm trapped under debris", "I'm safe", "I need medical help") with your coordinates added.
- **Help screen.** Tap-to-call Turkish emergency numbers (AFAD 122, police, ambulance, fire brigade, gendarmerie, Alo Deprem 186), an earthquake-kit checklist, and links to AFAD's website and earthquake map.
- **Notifications and theme.** On launch, the app asks for notification permission and registers for an Expo push token. Your light/dark theme choice is saved on the device.

### Current limitations

- **No earthquake data feed.** The app doesn't download earthquake events from any source. The Help screen links to AFAD instead.
- **Full mesh works on Android only.** The BLE advertiser and GATT server, which let a phone be discovered and receive messages, are native Kotlin modules. iOS builds can scan for and connect to other phones, but they can't advertise or receive.
- **Emergency-screen messages aren't sent yet.** Tapping a ready-made message only shows a confirmation. Sending it over the mesh isn't connected yet.
- **Mixed language.** The interface is partly Turkish and partly English.
- **Unused experiment.** `hooks/MeshRouter.ts`, `hooks/useNearbyMesh.ts` and `NearbyMeshModule.kt` are an experimental transport using Google Nearby Connections. The app doesn't register or use them.

## Tech stack

| Area | Tools |
| --- | --- |
| App | Expo SDK 52 (development build), React Native 0.76 with the New Architecture, TypeScript, Expo Router (drawer), Reanimated, Gesture Handler |
| Maps | `@rnmapbox/maps`, Mapbox Directions API, Expo Location |
| Mesh | `react-native-ble-plx` to scan and connect, plus custom Kotlin modules for the BLE advertiser and GATT server |
| Data | Firebase Authentication, Cloud Firestore, AsyncStorage, Expo Notifications |
| Backend (`server/`) | Node.js, Express, PostgreSQL (`pg`), Socket.IO |
| Testing | Jest (`jest-expo`), React Native Testing Library, GitHub Actions |

## Project structure

```
app/                  Expo Router screens
  login.tsx           Sign in / sign up with role selection
  (drawer)/dashboard  Map, SOS alerts, safe assembly points, rescue-team view
  (drawer)/mesh       BLE mesh: discovery, chat, emergency broadcast
  (drawer)/emergency  Ready-made emergency messages
  (drawer)/help       Emergency numbers, kit checklist, AFAD links
  (drawer)/settings   Account and preferences
hooks/                useMeshNetwork (BLE mesh), useLocationSync, useInternetConnectivity
context/              Firebase auth and theme providers
utils/                Firestore emergency helpers, geo helpers, native advertiser bridge
api/                  Typed client for the backend location API
server/               Express + PostgreSQL backend (separate npm package)
android/              Native Android project, including the Kotlin mesh modules
ios/                  Native iOS project
scripts/              adb helpers for installing on several Android devices at once
docs/                 Setup guides and development notes
```

**`api/` and `server/`.** `server/` is a small Express API. It stores device locations in a PostgreSQL `user_locations` table, which it creates on startup. Its endpoints are:

- `POST /api/locations`
- `GET /api/locations/device/:deviceId`
- `GET /api/locations/recent`
- `GET /api/locations/civilians`
- `GET /api/devices`, which the app also calls to check whether it has a connection

`api/` is the app's typed client for these endpoints. The server also has a Socket.IO relay and an `/admin` page that lists connected devices. Both are left over from an earlier design where the mesh ran through the server; the current app doesn't use Socket.IO.

## Getting started

### Prerequisites

- Node.js. CI uses Node 18.
- Android Studio with the Android SDK, and/or Xcode for iOS.
- Two or more physical Android phones to try the mesh. BLE doesn't work in emulators.

The app uses native modules, so it runs as an Expo development build. It doesn't work in Expo Go.

### App

```bash
npm install
npm run android        # expo run:android - build and install a dev build
npm run ios            # expo run:ios
npm start              # expo start - start Metro for an installed dev build
```

To install on several Android devices at once, run `./scripts/install-all-devices.sh`. See the multi-device guides below.

### Tests

```bash
npm test               # run the Jest suite
npm run test:coverage  # with coverage report
npm run test:simple    # lightweight config (jest.config.simple.js)
```

GitHub Actions (`.github/workflows/test.yml`) runs `npm run test:ci` on every push and pull request to `master`/`main`.

### Backend

```bash
cd server
npm install
npm run dev            # nodemon; or: npm start
```

The backend needs a running PostgreSQL database.

### Configuration

The repo contains no example env files. Everything below comes from the code.

**App**

- `EXPO_PUBLIC_API_URL` sets the backend base URL. `API_URL` is also read. Without either, debug builds use `http://10.0.2.2:3000` on the Android emulator and `http://localhost:3000` on the iOS simulator.
- `FirebaseConfig.ts` (repo root) is imported as `@/FirebaseConfig` but isn't committed. Create it and export an initialized Firebase `auth` and Firestore `db`. In the Firebase console, turn on Email/Password sign-in and Firestore.
- **Mapbox:** add your public access token where `Mapbox.setAccessToken` is called in `app/(drawer)/dashboard/index.tsx`. Add your downloads token as `RNMapboxMapsDownloadToken` in `app.json`. Both are placeholders in the repo.
- `expo.extra.eas.projectId` in `app.json` is needed for the Expo push token. Without it the app doesn't crash, but it gets no token.

**Server** (`server/.env`, loaded with dotenv)

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`

## Documentation

- [API and database setup](docs/API_SETUP.md)
- [Firebase authentication and roles](docs/AUTHENTICATION_SETUP.md)
- [Bluetooth mesh setup](docs/BLUETOOTH_SETUP.md)
- [Testing on multiple Android devices](docs/TESTING_MULTIPLE_ANDROID_DEVICES.md)
- Installing on several devices: [quick start](docs/QUICK_START_MULTIPLE_DEVICES.md), [one cable, many devices](docs/ONE_CABLE_MULTIPLE_DEVICES.md), [USB + wireless ADB](docs/MIXED_USB_WIRELESS_SETUP.md)
- [Test guide](docs/README_TESTS.md) (Turkish)
- [Frontend API client](api/README.md) and [backend server](server/README.md)

## Links

- Project website: https://kaancakr.github.io/quake-path/
- Website source: https://github.com/kaancakr/quake-path
