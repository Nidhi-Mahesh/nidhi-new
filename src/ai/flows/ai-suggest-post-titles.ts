'use server';
/**
 * @fileOverview An AI agent that suggests alternative titles for a blog post.
 *
 * - suggestPostTitles - A function that suggests alternative titles for a blog post.
 * - SuggestPostTitlesInput - The input type for the suggestPostTitles function.
 * - SuggestPostTitlesOutput - The return type for the suggestPostTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPostTitlesInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the blog post to generate titles for.'),
});
export type SuggestPostTitlesInput = z.infer<typeof SuggestPostTitlesInputSchema>;

const SuggestPostTitlesOutputSchema = z.object({
  titles: z.array(z.string()).describe('Five suggested titles for the blog post.'),
});
export type SuggestPostTitlesOutput = z.infer<typeof SuggestPostTitlesOutputSchema>;

export async function suggestPostTitles(input: SuggestPostTitlesInput): Promise<SuggestPostTitlesOutput> {
  return suggestPostTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPostTitlesPrompt',
  input: {schema: SuggestPostTitlesInputSchema},
  output: {schema: SuggestPostTitlesOutputSchema},
  prompt: `You are a blog post title generator.  Given the content of a blog post, you will generate five alternative titles that are catchy and effective.

Blog Post Content: {{{content}}}

Respond with ONLY five titles.  Do not include any other text in your response.`,
});

const suggestPostTitlesFlow = ai.defineFlow(
  {
    name: 'suggestPostTitlesFlow',
    inputSchema: SuggestPostTitlesInputSchema,
    outputSchema: SuggestPostTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
