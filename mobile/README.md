# Portfolio CRM — Android Mobile Application

Dedicated native mobile application for **Portfolio CRM** (Personal Wealth & Investment Manager), built with React Native and Expo SDK.

## Key Features
- **Real-Time Cloud Firestore Sync**: Seamless data sync with Desktop & Web via `users/{uid}/portfolio/data`.
- **Firebase Authentication**: Email & Password login, signup, and reset with offline persistence via AsyncStorage.
- **Fintech UI/UX**: Dark mode styling, custom orange/amber branding (`#f97316`), and responsive financial dashboard cards.
- **Complete Asset Management**:
  - **Holdings**: Direct equities and mutual funds with live P&L and investment stats.
  - **Savings & FDs**: Savings accounts and Fixed Deposits with Indian quarterly compounding maturity calculations ($A = P \times (1 + r/400)^{4t}$) and maturity day countdowns.
  - **Allocation**: Multi-segmented asset class exposure bar and diversification health ratings.
  - **Settings**: Profile control and manual cloud sync triggers.

---

## Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli eas-cli`)
- Android Studio or Expo Go app on an Android device

---

## Running in Development

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code using the **Expo Go** app on your Android phone, or press `a` to launch the Android emulator.

---

## Building the Android APK

### Option A: Cloud APK Build with EAS (Recommended, No Android Studio needed)
1. Log in to Expo:
   ```bash
   npx eas-cli login
   ```
2. Configure build profile:
   ```bash
   npx eas-cli build:configure
   ```
3. Generate standalone Android APK:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
   *EAS will compile and provide a direct download link to install `Portfolio-CRM.apk` on any Android device.*

### Option B: Local Android Build
1. Prebuild native Android project:
   ```bash
   npx expo prebuild --platform android
   ```
2. Build debug or release APK using Gradle:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *Output APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.*

---

## Project Structure
```
mobile/
├── App.js                   # Root container, auth gate, bottom navigation
├── app.json                 # Expo & Android package configuration
├── package.json             # React Native dependencies
├── src/
│   ├── firebaseConfig.js    # Firebase Auth & Cloud Firestore sync
│   ├── utils/
│   │   └── calculations.js  # Financial calculations (FD compounding, P&L)
│   └── screens/
│       ├── AuthScreen.js         # Login, signup, password reset
│       ├── DashboardScreen.js    # Net worth card, breakdown, activities
│       ├── HoldingsScreen.js     # Stocks and mutual funds manager
│       ├── SavingsScreen.js      # Savings & Fixed Deposits with FD compounding
│       ├── AllocationScreen.js   # Visual asset class distribution
│       └── SettingsScreen.js     # User profile, cloud sync status
```
