'use server';
/**
 * @fileOverview An AI agent for identifying implicit capabilities from existing MCPs.
 *
 * - identifyImplicitCapabilities - A function that handles the process of identifying implicit capabilities.
 * - IdentifyImplicitCapabilitiesInput - The input type for the identifyImplicitCapabilities function.
 * - IdentifyImplicitCapabilitiesOutput - The return type for the identifyImplicitCapabilities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImplicitCapabilitySchema = z.object({
  name: z.string().describe('The name of the implicit capability.'),
  description: z
    .string()
    .describe(
      'A description of the implicit capability and how it can arise from existing MCPs.'
    ),
});

const IdentifyImplicitCapabilitiesInputSchema = z.object({
  mcpDescriptions: z
    .string()
    .describe(
      'A detailed description of existing MCPs (Managed Capability Providers) and their explicit intended purposes.'
    ),
});
export type IdentifyImplicitCapabilitiesInput = z.infer<
  typeof IdentifyImplicitCapabilitiesInputSchema
>;

const IdentifyImplicitCapabilitiesOutputSchema = z.object({
  implicitCapabilities: z
    .array(ImplicitCapabilitySchema)
    .describe('A list of potential implicit capabilities derived from the MCPs.'),
});
export type IdentifyImplicitCapabilitiesOutput = z.infer<
  typeof IdentifyImplicitCapabilitiesOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'identifyImplicitCapabilitiesPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: IdentifyImplicitCapabilitiesInputSchema},
  output: {schema: IdentifyImplicitCapabilitiesOutputSchema},
  prompt: `You are a Capability Expansion Agent, an AI designed to identify implicit potential from explicit capabilities.

Your task is to analyze the provided descriptions of existing Managed Capability Providers (MCPs) and their explicit purposes.
Based on this information, you will identify and describe potential implicit capabilities that could arise from these MCPs.
Think creatively about how combining or extending the stated purposes could lead to new, unstated capabilities.

Existing MCP Descriptions:
{{{mcpDescriptions}}}`,
});

const identifyImplicitCapabilitiesFlow = ai.defineFlow(
  {
    name: 'identifyImplicitCapabilitiesFlow',
    inputSchema: IdentifyImplicitCapabilitiesInputSchema,
    outputSchema: IdentifyImplicitCapabilitiesOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('No output generated from AI model.');
      return output;
    } catch (error: any) {
      console.error('Error in identifyImplicitCapabilitiesFlow:', error);
      throw new Error(`AI Analysis Failed: ${error.message}`);
    }
  }
);

export async function identifyImplicitCapabilities(
  input: IdentifyImplicitCapabilitiesInput
): Promise<IdentifyImplicitCapabilitiesOutput> {
  return identifyImplicitCapabilitiesFlow(input);
}
