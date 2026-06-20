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

To deploy this application to Firebase Hosting:

1. **Update Project ID**:
   The project is already configured for `studio-8574497882-c7183`.

2. **Login to Firebase**:
   ```bash
   npx firebase login
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

Note: Ensure your environment variables are configured in the Firebase Console under Hosting/App Hosting settings for production functionality.
