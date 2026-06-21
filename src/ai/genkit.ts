import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for BWB-CODE-ASSISTANT.
 * Hardened to prevent module-level crashes during build-time or when keys are missing.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    // Provide the key if found, otherwise let the plugin attempt to resolve from env 
    // without crashing the module-level initialization.
    googleAI(apiKey ? { apiKey } : undefined),
  ],
});
