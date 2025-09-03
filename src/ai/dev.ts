import { config } from 'dotenv';
config();

import '@/ai/flows/ai-generate-draft-from-headline.ts';
import '@/ai/flows/ai-suggest-tags-and-categories.ts';
import '@/ai/flows/ai-generate-meta-description.ts';
import '@/ai/flows/ai-generate-alt-text.ts';
import '@/ai/flows/ai-suggest-post-titles.ts';
import '@/ai/flows/ai-chatbot.ts';
