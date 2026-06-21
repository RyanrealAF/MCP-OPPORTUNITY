import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for BWB-CODE-ASSISTANT.
 * Provides a centralized AI instance for orchestrating MCP capability expansion and collision analysis.
 * Hardened to prevent crashes during module evaluation if API keys are missing.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
});
