'use server';
/**
 * @fileOverview AI-powered tag and category suggestion flow.
 *
 * - suggestTagsAndCategories - A function that suggests relevant tags and categories for a given post.
 * - SuggestTagsAndCategoriesInput - The input type for the suggestTagsAndCategories function.
 * - SuggestTagsAndCategoriesOutput - The return type for the suggestTagsAndCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsAndCategoriesInputSchema = z.object({
  postContent: z
    .string()
    .describe('The content of the post for which to suggest tags and categories.'),
});
export type SuggestTagsAndCategoriesInput = z.infer<
  typeof SuggestTagsAndCategoriesInputSchema
>;

const SuggestTagsAndCategoriesOutputSchema = z.object({
  tags: z
    .array(z.object({tag: z.string(), confidence: z.number()}))
    .describe('A list of suggested tags with confidence levels.'),
  categories: z
    .array(z.object({category: z.string(), confidence: z.number()}))
    .describe('A list of suggested categories with confidence levels.'),
});
export type SuggestTagsAndCategoriesOutput = z.infer<
  typeof SuggestTagsAndCategoriesOutputSchema
>;

export async function suggestTagsAndCategories(
  input: SuggestTagsAndCategoriesInput
): Promise<SuggestTagsAndCategoriesOutput> {
  return suggestTagsAndCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsAndCategoriesPrompt',
  input: {schema: SuggestTagsAndCategoriesInputSchema},
  output: {schema: SuggestTagsAndCategoriesOutputSchema},
  prompt: `You are an expert blog content classifier. Given the content of a blog post, you will suggest relevant tags and categories with confidence levels.

Post Content: {{{postContent}}}

Suggest at least 3 tags and 2 categories.

Format your response as a JSON object with "tags" and "categories" fields. Each field should contain an array of objects with "tag" (or "category") and "confidence" (a number between 0 and 1) fields.`,
});

const suggestTagsAndCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestTagsAndCategoriesFlow',
    inputSchema: SuggestTagsAndCategoriesInputSchema,
    outputSchema: SuggestTagsAndCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
