# BWB Code Assistant
Industrial-grade ecosystem analyzer and code generation suite.

## Hierarchy
- **Repository**: `BWB-ROOT`
- **Primary Interface**: `BWB-CODE-ASSISTANT` (This Application)
- **Target Backend**: `BWB-MCP-SERVER`

## Documentation
- [Code Assistant Architecture](./docs/CODE-ASSISTANT-SYSTEM.md)
- [Agent Specifications](./docs/CODE-ASSISTANT-AGENTS.md)
- [MCP Server Roadmap & Proposals](./docs/MCP-SERVER-PROPOSALS.md)

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
- **Target Project**: `studio-8574497882-c7183`
- **Required**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `GEMINI_API_KEY`

### 4. Build & Deploy
Deploy the application to Firebase Hosting:
```bash
npm run deploy
```

## Features
- **Capability Agent**: Extracts implicit expansion potential from node metadata.
- **Collision Agent**: Simulates combinatorial collisions to discover novel systems.
- **Intent Agent**: Maps technological gaps by referencing strategic objectives.
- **Boilerplate Agent**: Generates production-ready TypeScript code for the **BWB-MCP-SERVER** ecosystem.
