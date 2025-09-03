
'use server';
/**
 * @fileOverview A chatbot that can answer questions about the website's posts.
 *
 * - websiteChatbot - A function that handles the chatbot interaction.
 * - WebsiteChatbotInput - The input type for the websiteChatbot function.
 * - WebsiteChatbotOutput - The return type for the websiteChatbot function.
 */

import {ai} from '@/ai/genkit';
import {getPosts} from '@/services/posts';
import {z} from 'genkit';

const WebsiteChatbotInputSchema = z.object({
  query: z.string().describe("The user's question about the posts."),
});
export type WebsiteChatbotInput = z.infer<typeof WebsiteChatbotInputSchema>;

const WebsiteChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's answer."),
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
  prompt: `You are a helpful AI assistant for the "Modern Chyrp" website. Your goal is to answer user questions based ONLY on the content of the blog posts provided.

Do not make up information. If the answer cannot be found in the provided posts, politely say that you don't have information on that topic.

Here is the user's question:
"{{{query}}}"

Here are all the blog posts from the website. Use them as your knowledge base:
---
{{#each posts}}
Title: {{{this.title}}}
Content: {{{this.content}}}
---
{{/each}}
`,
});

const websiteChatbotFlow = ai.defineFlow(
  {
    name: 'websiteChatbotFlow',
    inputSchema: WebsiteChatbotInputSchema,
    outputSchema: WebsiteChatbotOutputSchema,
  },
  async input => {
    const posts = await getPosts();
    
    // Simple serialization of posts for the prompt
    const postContext = posts.map(p => ({ title: p.title, content: p.content }));

    const {output} = await prompt({
        query: input.query,
        posts: postContext,
    });
    return output!;
  }
);
