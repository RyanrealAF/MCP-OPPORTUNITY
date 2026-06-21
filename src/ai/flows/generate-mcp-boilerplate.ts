'use server';
/**
 * @fileOverview A GenAI agent for generating MCP (Managed Capability Provider) boilerplate code.
 * Optimized for the BWB-MCP-SERVER architecture.
 *
 * - generateMcpBoilerplate - A function that generates TypeScript boilerplate for an MCP.
 * - GenerateMcpBoilerplateInput - The input type for the generateMcpBoilerplate function.
 * - GenerateMcpBoilerplateOutput - The return type for the generateMcpBoilerplate function.
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
Your goal is to generate high-quality, production-ready TypeScript boilerplate code for a new Managed Capability Provider (MCP) that will integrate into the BWB-MCP-SERVER backend.

### MCP Metadata:
Name: {{{name}}}
Description: {{{description}}}
Capabilities:
{{#each capabilities}}
- {{{this}}}
{{/each}}

### BWB-MCP-SERVER Requirements:
1. Use TypeScript with strict interface definitions.
2. Implement a class-based structure that extends the standard 'BaseMcpProvider'.
3. Include comprehensive JSDoc comments for each capability method.
4. Implement standard initialization logic, health checks, and error boundaries.
5. Ensure the code is modular and ready to be dropped into the BWB-MCP-SERVER /providers directory.

Output the code and a brief architectural explanation explaining how it fits into the BWB-MCP-SERVER hierarchy.`,
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
