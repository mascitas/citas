"use server";

import { chatSimulator } from "@/ai/flows/chat-simulator";

// This is a placeholder for a real chat backend.
// In this simulation, we are not using AI to respond.
export async function sendChatMessage(message: string, senderId: string, matchId: string) {
  // In a real application, this would save the message to a database.
  // For now, the state is handled in the AppContext.
  console.log(`Message from ${senderId} in match ${matchId}: ${message}`);
  return { success: true };
}
