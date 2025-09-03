'use server';

/**
 * @fileOverview AI-powered meta description generation for blog posts.
 *
 * - generateMetaDescription - A function to generate a meta description for a given blog post content.
 * - GenerateMetaDescriptionInput - The input type for the generateMetaDescription function.
 * - GenerateMetaDescriptionOutput - The return type for the generateMetaDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMetaDescriptionInputSchema = z.object({
  postContent: z
    .string()
    .describe('The content of the blog post to generate a meta description for.'),
});
export type GenerateMetaDescriptionInput = z.infer<
  typeof GenerateMetaDescriptionInputSchema
>;

const GenerateMetaDescriptionOutputSchema = z.object({
  metaDescription: z
    .string()
    .describe('The generated meta description for the blog post.'),
});
export type GenerateMetaDescriptionOutput = z.infer<
  typeof GenerateMetaDescriptionOutputSchema
>;

export async function generateMetaDescription(
  input: GenerateMetaDescriptionInput
): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an SEO expert. Generate a compelling and accurate meta description for the following blog post content. Keep the meta description under 160 characters.

Blog Post Content:
{{{postContent}}}`,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
