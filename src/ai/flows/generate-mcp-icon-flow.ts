'use server';
/**
 * @fileOverview A flow to generate industrial-grade icons for MCP providers.
 *
 * - generateMcpIcon - A wrapper function for the icon generation flow.
 * - GenerateMcpIconInput - The input type for the icon generation process.
 * - GenerateMcpIconOutput - The output type for the icon generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMcpIconInputSchema = z.object({
  name: z.string().describe('The name of the MCP provider.'),
  description: z.string().describe('The description of the MCP provider.'),
});
export type GenerateMcpIconInput = z.infer<typeof GenerateMcpIconInputSchema>;

const GenerateMcpIconOutputSchema = z.object({
  iconDataUri: z.string().describe('The base64 data URI of the generated icon.'),
});
export type GenerateMcpIconOutput = z.infer<typeof GenerateMcpIconOutputSchema>;

const generateMcpIconFlow = ai.defineFlow(
  {
    name: 'generateMcpIconFlow',
    inputSchema: GenerateMcpIconInputSchema,
    outputSchema: GenerateMcpIconOutputSchema,
  },
  async (input) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `An industrial, minimalist, tech-inspired vector icon for a software service named "${input.name}". 
        The service is described as: ${input.description}. 
        Style: Schematic, monochrome, blueprints, circuit-like, professional, white lines on dark background.`,
      });

      if (!media || !media.url) {
        throw new Error('AI failed to generate valid icon media.');
      }

      return {
        iconDataUri: media.url,
      };
    } catch (error: any) {
      console.error('Icon Generation Flow Error:', error);
      throw new Error(`Icon Generation Failed: ${error.message}`);
    }
  }
);

export async function generateMcpIcon(input: GenerateMcpIconInput): Promise<GenerateMcpIconOutput> {
  return generateMcpIconFlow(input);
}
