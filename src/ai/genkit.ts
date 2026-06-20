import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with robust environment variable handling.
 * We initialize the plugin with the key, but handle the case where it might be missing
 * to prevent top-level execution crashes during build/startup.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
});
