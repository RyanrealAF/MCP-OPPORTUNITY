import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for BWB-CODE-ASSISTANT.
 * Strictly adheres to Genkit 1.x syntax.
 * Uses a defensive approach for API key extraction to prevent module-level crashes during build-time.
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI(apiKey ? { apiKey } : undefined),
  ],
});