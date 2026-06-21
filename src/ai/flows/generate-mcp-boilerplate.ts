'use server';
/**
 * @fileOverview A GenAI agent for generating MCP (Managed Capability Provider) boilerplate code.
 * Optimized for the BWB-MCP-SERVER architecture with industrial enhancements.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMcpBoilerplateInputSchema = z.object({
  name: z.string().describe('The name of the MCP.'),
  description: z.string().describe('A description of the MCP purpose.'),
  capabilities: z.array(z.string()).describe('The explicit capabilities this MCP should implement.'),
});
export type GenerateMcpBoilerplateInput = z.infer<typeof GenerateMcpBoilerplateInputSchema>;

const GenerateMcpBoilerplateOutputSchema = z.object({
  code: z.string().describe('The TypeScript code for the MCP implementation.'),
  explanation: z.string().describe('A brief explanation of the implementation details.'),
});
export type GenerateMcpBoilerplateOutput = z.infer<typeof GenerateMcpBoilerplateOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateMcpBoilerplatePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateMcpBoilerplateInputSchema },
  output: { schema: GenerateMcpBoilerplateOutputSchema },
  prompt: `You are an expert software architect specializing in the BWB-MCP-SERVER ecosystem.
Your goal is to generate high-quality, production-ready TypeScript boilerplate code for a new Managed Capability Provider (MCP).

### MCP Metadata:
Name: {{{name}}}
Description: {{{description}}}
Capabilities:
{{#each capabilities}}
- {{{this}}}
{{/each}}

### BWB-MCP-SERVER Industrial Requirements (MANDATORY):
1. **BaseMcpProvider Enhancement**: Implement 'async healthCheck(): Promise<HealthStatus>' and 'getLatencyMetric(): number'.
2. **Inter-Provider Bus**: Use 'this.bus.publish()' and 'this.bus.subscribe()' for inter-provider communication.
3. **Telemetry**: Integrate OpenTelemetry hooks for monitoring and tracing.
4. **Auth Protocol**: If relevant, implement OIDC (OpenID Connect) support for secure identity propagation.
5. **Structure**: Extend the standard 'BaseMcpProvider' abstract class. Use strict TypeScript types.

Output the code and an architectural explanation.`,
});

const generateMcpBoilerplateFlow = ai.defineFlow(
  {
    name: 'generateMcpBoilerplateFlow',
    inputSchema: GenerateMcpBoilerplateInputSchema,
    outputSchema: GenerateMcpBoilerplateOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('Failed to generate boilerplate.');
      return output;
    } catch (error: any) {
      console.error('Error in generateMcpBoilerplateFlow:', error);
      throw new Error(`Boilerplate Generation Failed: ${error.message}`);
    }
  }
);

export async function generateMcpBoilerplate(
  input: GenerateMcpBoilerplateInput
): Promise<GenerateMcpBoilerplateOutput> {
  return generateMcpBoilerplateFlow(input);
}
