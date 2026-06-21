'use server';
/**
 * @fileOverview A flow to generate industrial-grade icons for MCP providers.
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
      // Using Imagen 4.0 Fast for high-quality industrial iconography
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A professional, industrial, minimalist vector icon for a software capability named "${input.name}". 
        Context: ${input.description}. 
        Style: schematic, blueprint-inspired, thin white lines on dark charcoal background, high tech, engineering diagram, technical symbol.`,
      });

      if (!media || !media.url) {
        throw new Error('Kernel failed to generate valid icon media.');
      }

      return {
        iconDataUri: media.url,
      };
    } catch (error: any) {
      console.error('Icon Generation Core Error:', error);
      throw new Error(`Generation Service Unavailable: ${error.message}`);
    }
  }
);

export async function generateMcpIcon(input: GenerateMcpIconInput): Promise<GenerateMcpIconOutput> {
  return generateMcpIconFlow(input);
}
