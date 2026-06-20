'use server';
/**
 * @fileOverview A GenAI agent for generating MCP (Managed Capability Provider) boilerplate code.
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
  input: { schema: GenerateMcpBoilerplateInputSchema },
  output: { schema: GenerateMcpBoilerplateOutputSchema },
  prompt: `You are an expert software architect specializing in the Managed Capability Provider (MCP) pattern.
Your goal is to generate high-quality, production-ready TypeScript boilerplate code for a new MCP.

### MCP Metadata:
Name: {{{name}}}
Description: {{{description}}}
Capabilities:
{{#each capabilities}}
- {{{this}}}
{{/each}}

### Requirements:
1. Use TypeScript with clear interface definitions.
2. Implement a class-based structure.
3. Include JSDoc comments for each capability method.
4. Ensure the code is clean, modular, and follows standard MCP patterns (e.g., initialization, error handling).

Output the code and a brief architectural explanation.`,
});

const generateMcpBoilerplateFlow = ai.defineFlow(
  {
    name: 'generateMcpBoilerplateFlow',
    inputSchema: GenerateMcpBoilerplateInputSchema,
    outputSchema: GenerateMcpBoilerplateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate boilerplate.');
    return output;
  }
);

export async function generateMcpBoilerplate(
  input: GenerateMcpBoilerplateInput
): Promise<GenerateMcpBoilerplateOutput> {
  return generateMcpBoilerplateFlow(input);
}
