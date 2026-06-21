'use server';
/**
 * @fileOverview A GenAI agent for generating novel system and project ideas via combinatorial collision.
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
  description: z.string().describe('Detailed explanation of the emergent architecture.'),
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
  prompt: `You are the BWB Collision Agent. Your goal is to simulate combinatorial collisions between existing Managed Capability Providers (MCPs).

### Input MCPs:
{{#each mcpDescriptions}}
- {{{this}}}
{{/each}}

### Input Capabilities:
{{#each capabilityDescriptions}}
- {{{this}}}
{{/each}}

{{#if contextOrConstraints}}
### Constraints:
{{{contextOrConstraints}}}
{{/if}}

Identify 3-5 novel systems that emerge from combining these nodes. Rank them by novelty.`,
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
        throw new Error('Simulation failed to yield valid systemic results.');
      }
      return { novelSystems: output };
    } catch (error: any) {
      console.error('Collision Agent Simulation Fault:', error);
      throw new Error(`Simulation Engine Failure: ${error.message || 'Unknown collision fault'}`);
    }
  }
);

export async function generateNovelSystems(
  input: GenerateNovelSystemsInput
): Promise<GenerateNovelSystemsOutput> {
  return generateNovelSystemsFlow(input);
}
