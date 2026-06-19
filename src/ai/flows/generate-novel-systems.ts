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
 * Schema for the input to the novelty ranker tool.
 */
const NoveltyRankerInputSchema = z.object({
  name: z.string().describe('The name of the novel system idea.'),
  description: z.string().describe('The description of the novel system idea.'),
  combinedMcps: z.array(z.string()).describe('The MCPs combined in this idea.'),
  combinedCapabilities: z.array(z.string()).describe('The capabilities combined in this idea.'),
});

/**
 * Schema for the output of the novelty ranker tool.
 */
const NoveltyRankerOutputSchema = z.object({
  noveltyRank: z.number().describe('A numerical rank indicating the novelty of the system, where higher is more novel (0-100).'),
});

/**
 * A placeholder tool that simulates ranking the novelty of a system or project idea.
 * In a real scenario, this would involve complex analysis based on various factors.
 */
const noveltyRanker = ai.defineTool(
  {
    name: 'noveltyRanker',
    description: 'Ranks the novelty of a given system or project idea on a scale of 0 to 100, where higher is more novel.',
    inputSchema: NoveltyRankerInputSchema,
    outputSchema: NoveltyRankerOutputSchema,
  },
  async (input) => {
    // Simulate a novelty ranking. In a real application, this would use a more sophisticated algorithm.
    // For now, it returns a random rank to demonstrate the tool's usage.
    const rank = Math.floor(Math.random() * 100) + 1; // Rank between 1 and 100
    console.log(`Assessing novelty for '${input.name}': Rank ${rank}`);
    return { noveltyRank: rank };
  }
);

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
  noveltyRank: z.number().describe('A numerical rank indicating the novelty of the system, where higher is more novel.'),
});

/**
 * Output schema for the generated novel system ideas.
 */
const GenerateNovelSystemsOutputSchema = z.object({
  novelSystems: z.array(NovelSystemIdeaOutputSchema).describe('A list of generated novel system and project ideas, each with a novelty rank.'),
});
export type GenerateNovelSystemsOutput = z.infer<typeof GenerateNovelSystemsOutputSchema>;

/**
 * Defines the prompt for generating novel system ideas.
 * This prompt instructs the LLM to combine existing MCPs and capabilities into new configurations.
 */
const generateNovelSystemsPrompt = ai.definePrompt({
  name: 'generateNovelSystemsPrompt',
  input: { schema: GenerateNovelSystemsInputSchema },
  output: { schema: z.array(NovelSystemIdeaOutputSchema.omit({ noveltyRank: true })) }, // Output without noveltyRank initially
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

Generate between 3 and 7 distinct and highly novel system or project ideas. For each idea, provide a concise name, a detailed description, and clearly list which MCPs and capabilities it combines. Focus on combinations that are not immediately obvious but hold significant potential.

Output your response as a JSON array of objects, where each object has a 'name', 'description', 'combinedMcps' (an array of strings), and 'combinedCapabilities' (an array of strings).`,
});

/**
 * Genkit flow for generating novel system and project ideas.
 * It uses an LLM to brainstorm ideas and then evaluates their novelty using a dedicated tool.
 */
const generateNovelSystemsFlow = ai.defineFlow(
  {
    name: 'generateNovelSystemsFlow',
    inputSchema: GenerateNovelSystemsInputSchema,
    outputSchema: GenerateNovelSystemsOutputSchema,
  },
  async (input) => {
    // Generate initial novel system ideas using the prompt
    const { output } = await generateNovelSystemsPrompt(input);

    if (!output || !Array.isArray(output)) {
      throw new Error('Failed to generate novel system ideas from the prompt.');
    }

    const novelSystemsWithRank: GenerateNovelSystemsOutput['novelSystems'] = [];

    // Iterate through generated ideas and apply the novelty ranker tool to each
    for (const idea of output) {
      const { noveltyRank } = await noveltyRanker({
        name: idea.name,
        description: idea.description,
        combinedMcps: idea.combinedMcps,
        combinedCapabilities: idea.combinedCapabilities,
      });
      novelSystemsWithRank.push({ ...idea, noveltyRank });
    }

    return { novelSystems: novelSystemsWithRank };
  }
);

/**
 * Generates novel system and project ideas by combining existing MCPs and capabilities,
 * then ranks their novelty.
 * @param input - The input containing MCP and capability descriptions, and optional constraints.
 * @returns A promise that resolves to a list of novel system ideas with their novelty ranks.
 */
export async function generateNovelSystems(
  input: GenerateNovelSystemsInput
): Promise<GenerateNovelSystemsOutput> {
  return generateNovelSystemsFlow(input);
}
