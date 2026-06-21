import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization with robust environment variable handling.
 * This prevents module-level crashes during Next.js build or SSR if keys are missing.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: apiKey ? [
    googleAI({
      apiKey: apiKey,
    }),
  ] : [],
});
