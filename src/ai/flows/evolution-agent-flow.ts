'use server';
/**
 * @fileOverview The Evolution Agent handles cross-repository codebase modifications.
 * Adheres to Genkit 1.x standards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvolutionAgentInputSchema = z.object({
  target: z.enum(['BWB-ROOT', 'BWB-CODE-ASSISTANT', 'BWB-MCP-SERVER']).describe('The target repository to modify.'),
  instruction: z.string().describe('The natural language instruction for the change.'),
  context: z.string().optional().describe('Additional context or existing code snippets.'),
});
export type EvolutionAgentInput = z.infer<typeof EvolutionAgentInputSchema>;

const EvolutionAgentOutputSchema = z.object({
  patchDescription: z.string().describe('Detailed description of the proposed changes.'),
  code: z.string().describe('The code or configuration changes to apply.'),
  filesAffected: z.array(z.string()).describe('List of files that will be modified.'),
  impactAnalysis: z.string().describe('An analysis of how this change affects the ecosystem.'),
});
export type EvolutionAgentOutput = z.infer<typeof EvolutionAgentOutputSchema>;

const prompt = ai.definePrompt({
  name: 'evolutionAgentPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: EvolutionAgentInputSchema },
  output: { schema: EvolutionAgentOutputSchema },
  prompt: `You are the BWB Evolution Agent, a high-level system architect with write-access permissions across the ecosystem.

### Target Repository: {{{target}}}
### Instruction: {{{instruction}}}
{{#if context}}
### Context:
{{{context}}}
{{/if}}

### Requirements:
1. Generate precise, production-ready code or configuration for the target.
2. If the target is BWB-ROOT, focus on infrastructure, build scripts, or project-wide documentation.
3. If the target is BWB-CODE-ASSISTANT, focus on UI components, AI flows, or React logic.
4. If the target is BWB-MCP-SERVER, focus on backend providers, core engine logic, or MCP interfaces.
5. Provide a clear impact analysis explaining how this change propagates through the hierarchy.

Output the patch details and code implementation.`,
});

const evolutionAgentFlow = ai.defineFlow(
  {
    name: 'evolutionAgentFlow',
    inputSchema: EvolutionAgentInputSchema,
    outputSchema: EvolutionAgentOutputSchema,
  },
  async (input) => {
    try {
      const response = await prompt(input);
      if (!response.output) throw new Error('Evolution Agent failed to generate patch.');
      return response.output;
    } catch (error: any) {
      console.error('Error in evolutionAgentFlow:', error);
      throw new Error(`Evolution Failed: ${error.message}`);
    }
  }
);

export async function executeEvolution(input: EvolutionAgentInput): Promise<EvolutionAgentOutput> {
  return evolutionAgentFlow(input);
}
