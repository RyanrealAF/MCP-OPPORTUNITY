
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

export async function generateMcpIcon(input: GenerateMcpIconInput): Promise<GenerateMcpIconOutput> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: `An industrial, minimalist, tech-inspired vector icon for a software service named "${input.name}". 
    The service is described as: ${input.description}. 
    Style: Schematic, monochrome, blueprints, circuit-like, professional, white lines on dark background.`,
  });

  if (!media) {
    throw new Error('Failed to generate icon media.');
  }

  return {
    iconDataUri: media.url,
  };
}
