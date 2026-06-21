import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Genkit initialization for BWB-CODE-ASSISTANT.
 * Strictly adheres to Genkit 1.x syntax.
 * Provides a centralized AI instance for orchestrating MCP capability expansion and collision analysis.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
});
