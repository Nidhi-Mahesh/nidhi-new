import {genkit, Credential} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let googleAICredentials;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    googleAICredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) as Credential;
  } catch (e) {
    console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON", e);
  }
}

export const ai = genkit({
  plugins: [googleAI({credentials: googleAICredentials})],
  model: 'googleai/gemini-2.5-flash',
});
