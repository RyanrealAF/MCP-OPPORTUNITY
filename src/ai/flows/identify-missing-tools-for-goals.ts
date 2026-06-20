'use server';
/**
 * @fileOverview An AI agent that identifies missing tools or MCPs required to achieve strategic goals.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMissingToolsForGoalsInputSchema = z.object({
  goals: z.array(z.string()).describe('Strategic goals.'),
  existingCapabilities: z.array(z.string()).describe('Existing capabilities.'),
});
export type IdentifyMissingToolsForGoalsInput = z.infer<typeof IdentifyMissingToolsForGoalsInputSchema>;

const IdentifyMissingToolsForGoalsOutputSchema = z.object({
  missingTools: z.array(z.string()).describe('Missing tools.'),
  reasoning: z.string().describe('Explanation.'),
});
export type IdentifyMissingToolsForGoalsOutput = z.infer<typeof IdentifyMissingToolsForGoalsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'identifyMissingToolsForGoalsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: IdentifyMissingToolsForGoalsInputSchema},
  output: {schema: IdentifyMissingToolsForGoalsOutputSchema},
  prompt: `You are a gap analyst. Identify missing tools to achieve these goals:
Goals:
{{#each goals}}
- {{{this}}}
{{/each}}

Existing:
{{#each existingCapabilities}}
- {{{this}}}
{{/each}}`,
});

const identifyMissingToolsForGoalsFlow = ai.defineFlow(
  {
    name: 'identifyMissingToolsForGoalsFlow',
    inputSchema: IdentifyMissingToolsForGoalsInputSchema,
    outputSchema: IdentifyMissingToolsForGoalsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('No output from gap analysis.');
      return output;
    } catch (error: any) {
      console.error('Error in identifyMissingToolsForGoalsFlow:', error);
      throw new Error(`Gap Analysis Failed: ${error.message}`);
    }
  }
);

export async function identifyMissingToolsForGoals(
  input: IdentifyMissingToolsForGoalsInput
): Promise<IdentifyMissingToolsForGoalsOutput> {
  return identifyMissingToolsForGoalsFlow(input);
}
