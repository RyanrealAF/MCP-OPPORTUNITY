'use server';
/**
 * @fileOverview The Evolution Agent handles cross-repository codebase modifications.
 * Enhanced to support BWB-MCP-SERVER industrial standards.
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
  prompt: `You are the BWB Evolution Agent, a high-level system architect.

### Target Repository: {{{target}}}
### Instruction: {{{instruction}}}
{{#if context}}
### Context:
{{{context}}}
{{/if}}

### BWB-MCP-SERVER Industrial Standards (REQUIRED FOR SERVER TARGET):
- Any structural modification to providers MUST include health checks and telemetry metrics.
- Inter-provider communication MUST leverage the standardized message bus.
- Security updates MUST align with OIDC standards.

### Requirements:
1. Generate precise, production-ready code for the target.
2. Provide a clear impact analysis explaining ecosystem propagation.

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
