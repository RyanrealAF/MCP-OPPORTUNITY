# BWB Code Assistant

This is an industrial-grade ecosystem analyzer and code generation suite, designed to manage Managed Capability Providers (MCPs) and strategic objectives.

## Features
- **Registry Management**: Track and search your MCP inventory.
- **Strategic Alignment**: Map strategic goals against existing technical capabilities.
- **AI-Powered Analysis**: Use specialized agents (Capability, Collision, Intent, Boilerplate) to identify implicit capabilities, ecosystem gaps, and novel system architectures.
- **Code Generation**: Instantly generate TypeScript boilerplate for new MCP implementations.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS, ShadCN UI, Lucide Icons
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Genkit with Google Gemini

## Deployment

To deploy this application to Firebase Hosting (which supports Next.js Server Actions and AI flows), follow these steps:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize/Target Project**:
   Update the `.firebaserc` file with your actual Firebase Project ID or run:
   ```bash
   firebase use --add
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

Note: Ensure your environment variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) are configured in the Firebase Console under Hosting/App Hosting settings.
