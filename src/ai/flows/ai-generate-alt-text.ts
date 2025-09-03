'use server';
/**
 * @fileOverview Generates alt text for images using AI.
 *
 * - generateAltText - A function that generates alt text for an image.
 * - GenerateAltTextInput - The input type for the generateAltText function.
 * - GenerateAltTextOutput - The return type for the generateAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAltTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAltTextInput = z.infer<typeof GenerateAltTextInputSchema>;

const GenerateAltTextOutputSchema = z.object({
  altText: z
    .string()
    .describe('The generated alt text for the image.'),
});
export type GenerateAltTextOutput = z.infer<typeof GenerateAltTextOutputSchema>;

export async function generateAltText(input: GenerateAltTextInput): Promise<GenerateAltTextOutput> {
  return generateAltTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAltTextPrompt',
  input: {schema: GenerateAltTextInputSchema},
  output: {schema: GenerateAltTextOutputSchema},
  prompt: `You are an expert in generating alt text for images. Your goal is to create concise and descriptive alt text that accurately represents the image content for visually impaired users and search engines.

Analyze the image provided and generate alt text that is:

- Descriptive: Accurately describe the key elements and context of the image.
- Concise: Keep the alt text brief and to the point (ideally under 125 characters).
- Relevant: Focus on the most important aspects of the image.
- Accessible: Ensure the alt text is understandable and helpful for users with visual impairments.

Image: {{media url=imageDataUri}}

Alt Text: `,
});

const generateAltTextFlow = ai.defineFlow(
  {
    name: 'generateAltTextFlow',
    inputSchema: GenerateAltTextInputSchema,
    outputSchema: GenerateAltTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
