'use server';
/**
 * @fileOverview A chatbot that can answer questions about the website's posts and general questions.
 *
 * - websiteChatbot - A function that handles the chatbot interaction.
 * - WebsiteChatbotInput - The input type for the websiteChatbot function.
 * - WebsiteChatbotOutput - The return type for the websiteChatbot function.
 */

import {ai} from '@/ai/genkit';
import {getPostsForChatbot} from '@/services/chatbot';
import {z} from 'genkit';

const WebsiteChatbotInputSchema = z.object({
  query: z.string().describe("The user's question about the posts or any general topic."),
});
export type WebsiteChatbotInput = z.infer<typeof WebsiteChatbotInputSchema>;

const WebsiteChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's comprehensive answer."),
});
export type WebsiteChatbotOutput = z.infer<typeof WebsiteChatbotOutputSchema>;

export async function websiteChatbot(input: WebsiteChatbotInput): Promise<WebsiteChatbotOutput> {
  return websiteChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'websiteChatbotPrompt',
  input: {schema: z.object({
    query: z.string(),
    posts: z.any(),
  })},
  output: {schema: WebsiteChatbotOutputSchema},
  prompt: `You are a helpful AI assistant for a website. You can answer both general questions and specific questions about the website's blog posts.

**Instructions:**

1. **For questions about the website/blog posts:** Use ONLY the information from the provided posts below. Search thoroughly through all posts for any relevant keywords, topics, or related content. Provide detailed, comprehensive answers including:
   - Direct quotes or specific details from relevant posts
   - Multiple posts if they relate to the question
   - Complete context and background information from the posts
   - Author information and post dates when relevant

2. **For general questions (not about the website):** Use your general knowledge to provide helpful, accurate, and informative answers.

3. **For mixed questions:** If the question has both general and website-specific components, answer both parts - use post content for website-related aspects and general knowledge for other aspects.

**User's question:**
"{{{query}}}"

**Complete website blog posts database:**
{{#each posts}}
---
**Post Title:** {{{this.title}}}
**Author:** {{{this.author}}}
**Date:** {{{this.createdAt}}}
**Content:** {{{this.content}}}
**Tags:** {{{this.tags}}}
**Categories:** {{{this.categories}}}
**Description:** {{{this.metaDescription}}}
---
{{/each}}

**Response Guidelines:**
- If the question relates to ANY keyword, topic, or concept mentioned in the posts, provide comprehensive details from ALL relevant posts
- Include specific examples, quotes, and details from the posts when applicable
- If it's a general question not related to the posts, provide a thoughtful, informative answer based on your knowledge
- Be conversational and helpful in tone
- If you find partial information in posts, mention what's available and note if more context might exist in other posts
`,
});

const websiteChatbotFlow = ai.defineFlow(
  {
    name: 'websiteChatbotFlow',
    inputSchema: WebsiteChatbotInputSchema,
    outputSchema: WebsiteChatbotOutputSchema,
  },
  async input => {
    const postContext = await getPostsForChatbot();

    const {output} = await prompt({
        query: input.query,
        posts: postContext,
    });
    return output!;
  }
);
