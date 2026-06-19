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

/**
 * Input schema for generating novel system ideas.
 */
const GenerateNovelSystemsInputSchema = z.object({
  mcpDescriptions: z.array(z.string()).describe('A list of existing Micro Capability Pod (MCP) descriptions.'),
  capabilityDescriptions: z.array(z.string()).describe('A list of existing capability descriptions.'),
  contextOrConstraints: z.string().optional().describe('Optional context or constraints to guide the generation of novel systems (e.g., "focus on sustainable energy solutions").'),
});
export type GenerateNovelSystemsInput = z.infer<typeof GenerateNovelSystemsInputSchema>;

/**
 * Schema for a single novel system idea, including its novelty rank.
 */
const NovelSystemIdeaOutputSchema = z.object({
  name: z.string().describe('A concise, descriptive name for the novel system or project idea.'),
  description: z.string().describe('A detailed explanation of the novel system, its purpose, and how it combines MCPs and capabilities.'),
  combinedMcps: z.array(z.string()).describe('A list of MCP names or key descriptors that are combined in this novel system.'),
  combinedCapabilities: z.array(z.string()).describe('A list of capability names or key descriptors that are leveraged in this novel system.'),
  noveltyRank: z.number().min(0).max(100).describe('A numerical rank indicating the novelty of the system, where higher is more novel (0-100). Evaluated based on combinatorial rarity.'),
});

/**
 * Output schema for the generated novel system ideas.
 */
const GenerateNovelSystemsOutputSchema = z.object({
  novelSystems: z.array(NovelSystemIdeaOutputSchema).describe('A list of generated novel system and project ideas, each with an AI-evaluated novelty rank.'),
});
export type GenerateNovelSystemsOutput = z.infer<typeof GenerateNovelSystemsOutputSchema>;

/**
 * Defines the prompt for generating novel system ideas.
 * This prompt instructs the LLM to combine existing MCPs and capabilities into new configurations.
 */
const generateNovelSystemsPrompt = ai.definePrompt({
  name: 'generateNovelSystemsPrompt',
  input: { schema: GenerateNovelSystemsInputSchema },
  output: { schema: z.array(NovelSystemIdeaOutputSchema) },
  prompt: `You are an expert innovation lead tasked with generating novel system and project ideas by combining existing Micro Capability Pods (MCPs) and capabilities.
Your goal is to identify unique and valuable configurations that can lead to new opportunities.

Here are the existing MCPs:
{{#each mcpDescriptions}}
- {{{this}}}
{{/each}}

Here are the existing capabilities:
{{#each capabilityDescriptions}}
- {{{this}}}
{{/each}}

{{#if contextOrConstraints}}
Consider the following context or constraints for your generation:
{{{contextOrConstraints}}}
{{/if}}

Generate between 3 and 7 distinct and highly novel system or project ideas. 
For each idea, provide a concise name, a detailed description, list which MCPs and capabilities it combines, and assign a 'noveltyRank' from 0 to 100 based on how unusual or transformative the combination is.

Output your response as a JSON array of objects.`,
});

/**
 * Genkit flow for generating novel system and project ideas.
 * It uses an LLM to brainstorm ideas and evaluate their novelty rank based on combinatorial reasoning.
 */
const generateNovelSystemsFlow = ai.defineFlow(
  {
    name: 'generateNovelSystemsFlow',
    inputSchema: GenerateNovelSystemsInputSchema,
    outputSchema: GenerateNovelSystemsOutputSchema,
  },
  async (input) => {
    const { output } = await generateNovelSystemsPrompt(input);

    if (!output || !Array.isArray(output)) {
      throw new Error('Failed to generate novel system ideas.');
    }

    return { novelSystems: output };
  }
);

/**
 * Generates novel system and project ideas by combining existing MCPs and capabilities.
 * @param input - The input containing MCP and capability descriptions, and optional constraints.
 * @returns A promise that resolves to a list of novel system ideas with their novelty ranks.
 */
export async function generateNovelSystems(
  input: GenerateNovelSystemsInput
): Promise<GenerateNovelSystemsOutput> {
  return generateNovelSystemsFlow(input);
}
