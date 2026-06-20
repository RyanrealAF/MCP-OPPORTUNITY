'use server';
/**
 * @fileOverview A GenAI agent for generating novel system and project ideas.
 *
 * - generateNovelSystems - A function that generates novel system and project ideas.
 * - GenerateNovelSystemsInput - The input type for the generateNovelSystems function.
 * - GenerateNovelSystemsOutput - The return type for the generateNovelSystems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNovelSystemsInputSchema = z.object({
  mcpDescriptions: z.array(z.string()).describe('A list of existing MCP descriptions.'),
  capabilityDescriptions: z.array(z.string()).describe('A list of existing capability descriptions.'),
  contextOrConstraints: z.string().optional().describe('Optional context or constraints.'),
});
export type GenerateNovelSystemsInput = z.infer<typeof GenerateNovelSystemsInputSchema>;

const NovelSystemIdeaOutputSchema = z.object({
  name: z.string().describe('Name of the novel system.'),
  description: z.string().describe('Detailed explanation.'),
  combinedMcps: z.array(z.string()).describe('List of combined MCPs.'),
  combinedCapabilities: z.array(z.string()).describe('List of leveraged capabilities.'),
  noveltyRank: z.number().min(0).max(100).describe('Novelty score (0-100).'),
});

const GenerateNovelSystemsOutputSchema = z.object({
  novelSystems: z.array(NovelSystemIdeaOutputSchema).describe('List of generated ideas.'),
});
export type GenerateNovelSystemsOutput = z.infer<typeof GenerateNovelSystemsOutputSchema>;

const generateNovelSystemsPrompt = ai.definePrompt({
  name: 'generateNovelSystemsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateNovelSystemsInputSchema },
  output: { schema: z.array(NovelSystemIdeaOutputSchema) },
  prompt: `You are an expert innovation lead tasked with generating novel system ideas by combining existing MCPs and capabilities.

MCPs:
{{#each mcpDescriptions}}
- {{{this}}}
{{/each}}

Capabilities:
{{#each capabilityDescriptions}}
- {{{this}}}
{{/each}}

{{#if contextOrConstraints}}
Constraints: {{{contextOrConstraints}}}
{{/if}}

Generate 3-7 novel system ideas. Output as a JSON array.`,
});

const generateNovelSystemsFlow = ai.defineFlow(
  {
    name: 'generateNovelSystemsFlow',
    inputSchema: GenerateNovelSystemsInputSchema,
    outputSchema: GenerateNovelSystemsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await generateNovelSystemsPrompt(input);
      if (!output || !Array.isArray(output)) {
        throw new Error('Failed to generate valid novel system ideas.');
      }
      return { novelSystems: output };
    } catch (error: any) {
      console.error('Error in generateNovelSystemsFlow:', error);
      throw new Error(`AI Generation Failed: ${error.message}`);
    }
  }
);

export async function generateNovelSystems(
  input: GenerateNovelSystemsInput
): Promise<GenerateNovelSystemsOutput> {
  return generateNovelSystemsFlow(input);
}
