import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for BWB-CODE-ASSISTANT.
 * Hardened to prevent module-level crashes during build-time or when keys are missing.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    // Provide the key explicitly if found to ensure the plugin has what it needs
    // even if standard env vars are not yet populated in the current process.
    googleAI(apiKey ? { apiKey } : undefined),
  ],
});
