
# BWB Code Assistant
Industrial-grade ecosystem analyzer and code generation suite.

## Deployment Instructions

### 1. Project Configuration
Ensure you have the Firebase CLI installed:
```bash
npm install -g firebase-tools
```

### 2. Authentication
Login to your Google account:
```bash
npx firebase login
```

### 3. Environment Setup
Populate the `.env` file with your credentials from the Firebase Console and Google AI Studio (for Gemini API).
- Target Project: `studio-8574497882-c7183`

### 4. Build & Deploy
Deploy the application to Firebase Hosting:
```bash
npm run deploy
```

## Features
- **Capability Agent**: Extracts implicit expansion potential from MCP metadata.
- **Collision Agent**: Simulates combinatorial collisions to discover novel system architectures.
- **Intent Agent**: Maps technological gaps by referencing strategic objectives.
- **Boilerplate Agent**: Generates industrial-grade TypeScript code for MCP implementations.
