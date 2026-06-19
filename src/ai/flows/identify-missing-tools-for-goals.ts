'use server';
/**
 * @fileOverview An AI agent that identifies missing tools or MCPs required to achieve strategic goals.
 *
 * - identifyMissingToolsForGoals - A function that handles the identification of missing tools for given goals.
 * - IdentifyMissingToolsForGoalsInput - The input type for the identifyMissingToolsForGoals function.
 * - IdentifyMissingToolsForGoalsOutput - The return type for the identifyMissingToolsForGoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMissingToolsForGoalsInputSchema = z.object({
  goals: z
    .array(z.string())
    .describe('A list of strategic goals that need to be achieved.'),
  existingCapabilities: z
    .array(z.string())
    .describe(
      'A list of existing capabilities or tools available in the ecosystem, derived from the MCP Knowledge Graph.'
    ),
});
export type IdentifyMissingToolsForGoalsInput = z.infer<
  typeof IdentifyMissingToolsForGoalsInputSchema
>;

const IdentifyMissingToolsForGoalsOutputSchema = z.object({
  missingTools: z
    .array(z.string())
    .describe('A list of specific tools or capabilities identified as missing to achieve the goals.'),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of why these tools are missing and how they would contribute to achieving the specified goals.'
    ),
});
export type IdentifyMissingToolsForGoalsOutput = z.infer<
  typeof IdentifyMissingToolsForGoalsOutputSchema
>;

export async function identifyMissingToolsForGoals(
  input: IdentifyMissingToolsForGoalsInput
): Promise<IdentifyMissingToolsForGoalsOutput> {
  return identifyMissingToolsForGoalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMissingToolsForGoalsPrompt',
  input: {schema: IdentifyMissingToolsForGoalsInputSchema},
  output: {schema: IdentifyMissingToolsForGoalsOutputSchema},
  prompt: `You are an expert strategic planner focused on identifying technological gaps within an ecosystem.
Your task is to analyze a set of strategic goals and compare them against the available capabilities to determine what specific tools or Multi-Cloud Platforms (MCPs) are missing.

### Strategic Goals:
{{#each goals}}
- {{{this}}}
{{/each}}

### Existing Capabilities:
{{#each existingCapabilities}}
- {{{this}}}
{{/each}}

Based on the above, identify the critical tools or capabilities that are absent but necessary to achieve the stated goals. For each missing item, provide a brief justification.

Ensure your output directly matches the specified JSON schema for 'missingTools' and 'reasoning'.`,
});

const identifyMissingToolsForGoalsFlow = ai.defineFlow(
  {
    name: 'identifyMissingToolsForGoalsFlow',
    inputSchema: IdentifyMissingToolsForGoalsInputSchema,
    outputSchema: IdentifyMissingToolsForGoalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
