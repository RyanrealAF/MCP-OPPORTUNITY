# BWB Code Assistant
Industrial-grade ecosystem analyzer and code generation suite.

## Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd bwb-code-assistant
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and populate it with your credentials:
```env
# Firebase Client Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-8574497882-c7183.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-8574497882-c7183
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-8574497882-c7183.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Config (Google AI Studio)
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

### 3. Firebase Console Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/project/studio-8574497882-c7183/overview).
2. Enable **Authentication** and activate the **Google** provider.
3. Initialize **Firestore Database** in `us-central1`.
4. Deploy the Security Rules (handled automatically via `npm run deploy`).

### 4. Development
```bash
npm run dev
```

### 5. Deployment
Deploy to Firebase Hosting (configured for Next.js SSR):
```bash
npx firebase login
npm run deploy
```

## Architecture
- **Framework**: Next.js 15 (App Router)
- **AI**: Genkit (Gemini 2.5 Flash)
- **Database**: Firestore (Real-time sync)
- **Auth**: Firebase Auth (Google)
- **UI**: Tailwind CSS + ShadCN (Industrial Theme)