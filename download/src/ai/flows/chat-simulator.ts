'use server';

/**
 * @fileOverview Simulates chat interactions with different personalities.
 *
 * - chatSimulator - A function that simulates a chat interaction based on a given personality.
 * - ChatSimulatorInput - The input type for the chatSimulator function.
 * - ChatSimulatorOutput - The return type for the chatSimulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatSimulatorInputSchema = z.object({
  personality: z
    .string()
    .describe('The personality of the simulated user, e.g., friendly, flirty, intellectual.'),
  message: z.string().describe('The user message to simulate a response to.'),
});
export type ChatSimulatorInput = z.infer<typeof ChatSimulatorInputSchema>;

const ChatSimulatorOutputSchema = z.object({
  response: z.string().describe('The simulated response from the user with the given personality.'),
});
export type ChatSimulatorOutput = z.infer<typeof ChatSimulatorOutputSchema>;

export async function chatSimulator(input: ChatSimulatorInput): Promise<ChatSimulatorOutput> {
  return chatSimulatorFlow(input);
}

const chatSimulatorPrompt = ai.definePrompt({
  name: 'chatSimulatorPrompt',
  input: {schema: ChatSimulatorInputSchema},
  output: {schema: ChatSimulatorOutputSchema},
  prompt: `Actúa como una persona con la siguiente personalidad: {{personality}}.
Responde al siguiente mensaje de chat.
Mensaje: "{{message}}".

IMPORTANTE: Tu respuesta DEBE ser exclusivamente en español. No uses inglés bajo ninguna circunstancia.`,
});

const chatSimulatorFlow = ai.defineFlow(
  {
    name: 'chatSimulatorFlow',
    inputSchema: ChatSimulatorInputSchema,
    outputSchema: ChatSimulatorOutputSchema,
  },
  async input => {
    const {output} = await chatSimulatorPrompt(input);
    return output!;
  }
);
