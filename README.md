# Portfolio CRM — Personal Wealth & Investment Manager

A mobile-first, high-end personal wealth management application for Indian equities, mutual funds, ETFs, emergency reserves, fixed deposits, and alternative assets. Powered by **React 18**, **Vite 6**, **Tailwind CSS**, **Recharts**, and **Firebase Authentication & Cloud Firestore**.

---

## Key Features

- **Full Firebase Authentication**: Secure Sign In, Sign Up, Forgot Password email dispatch, and action-code password reset handling.
- **Two-Tier Synchronization**: Instant offline PWA performance with browser cache + automatic cloud backup across devices via Google Cloud Firestore.
- **User Data Isolation**: Multi-tenant per-user data scoping (`users/{uid}`) with automated zero-loss migration for legacy local portfolios.
- **Modern Fintech Visual Identity**: Warm orange/amber palette, DM Sans & Manrope typography, crisp cards, dark mode toggle, and micro-interactions.
- **Shares & Mutual Funds Tracker**: P&L tracking, inline quick price editing, modal position manager, multi-column sorting, and asset type filtering.
- **Savings & Fixed Deposits Tracker**: Quarterly compounding maturity calculation (`A = P * (1 + r / 400)^(4 * t)`), remaining days countdown alerts, and category filtering.
- **Asset Class Allocation**: Dynamic Recharts Donut chart with category weight progress meters.
- **Analytics & Health Reports**: Portfolio diversification score, weighted fixed yield, and gainer/drawdown analysis.
- **Data Portability**: Full JSON backup export and import for disaster recovery.
- **Progressive Web App (PWA)**: Auto-updating service worker precache with standalone app install support for Android, iOS, Windows, and macOS.

---

## Local Setup & Development

### Prerequisites
- **Node.js**: v18.0.0 or newer
- **npm**: v9.0.0 or newer

### Installation
```bash
npm install
```

### Environment Configuration
The application is pre-configured with your Firebase project in `.env.local`:
```env
VITE_FIREBASE_API_KEY=AIzaSyCklW75pWdpTOaxiVIz8OFRNR7EaaUuD14
VITE_FIREBASE_AUTH_DOMAIN=vishnucrm-90dcc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vishnucrm-90dcc
VITE_FIREBASE_STORAGE_BUCKET=vishnucrm-90dcc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=231097803577
VITE_FIREBASE_APP_ID=1:231097803577:web:3915b51f22046dc1aabee8
VITE_FIREBASE_MEASUREMENT_ID=G-3ZXEX83M0X
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```
Output bundle is generated in `dist/` with optimized code splitting for vendor, Recharts, Lucide icons, and Firebase.

---

## Security & Cloud Firestore Rules

The application uses the security rules configured in `firestore.rules`:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User-isolated security rule: users can only access their own portfolio data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Default fallback rule
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 10, 19);
    }
  }
}
```

---

## Deployment Options

### Vercel / Netlify / Cloudflare Pages
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Add the variables from `.env.local` to your hosting project settings.