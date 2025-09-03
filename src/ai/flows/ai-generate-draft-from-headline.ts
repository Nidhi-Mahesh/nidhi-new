'use server';
/**
 * @fileOverview AI-assisted draft generation from a headline or brief.
 *
 * - generateDraftFromHeadline - A function that generates a draft outline and initial content from a headline.
 * - GenerateDraftFromHeadlineInput - The input type for the generateDraftFromHeadline function.
 * - GenerateDraftFromHeadlineOutput - The return type for the generateDraftFromHeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDraftFromHeadlineInputSchema = z.object({
  headline: z.string().describe('The headline or brief for the post.'),
});
export type GenerateDraftFromHeadlineInput = z.infer<
  typeof GenerateDraftFromHeadlineInputSchema
>;

const GenerateDraftFromHeadlineOutputSchema = z.object({
  title: z.string().describe('The suggested title for the post.'),
  outline: z.string().describe('The outline of the post.'),
  draft: z.string().describe('The initial draft content of the post.'),
});
export type GenerateDraftFromHeadlineOutput = z.infer<
  typeof GenerateDraftFromHeadlineOutputSchema
>;

export async function generateDraftFromHeadline(
  input: GenerateDraftFromHeadlineInput
): Promise<GenerateDraftFromHeadlineOutput> {
  return generateDraftFromHeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDraftFromHeadlinePrompt',
  input: {schema: GenerateDraftFromHeadlineInputSchema},
  output: {schema: GenerateDraftFromHeadlineOutputSchema},
  prompt: `You are an expert content creator. Generate a blog post draft based on the provided headline or brief.\n\nHeadline/Brief: {{{headline}}}\n\nYour response should include:\n1.  A suggested title for the post.
2.  An outline of the post, including sections and sub-sections.
3.  An initial draft of the post content, expanding on the outline.\n\nEnsure the draft is well-structured, engaging, and informative.\n\nOutput in markdown format.`,
});

const generateDraftFromHeadlineFlow = ai.defineFlow(
  {
    name: 'generateDraftFromHeadlineFlow',
    inputSchema: GenerateDraftFromHeadlineInputSchema,
    outputSchema: GenerateDraftFromHeadlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
