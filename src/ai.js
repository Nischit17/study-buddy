import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Stop the server at startup if the key is missing (same idea as JWT_SECRET)
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Add it to your .env file.");
}

// One client for the whole app; give up on a request after 60 seconds
const ai = new GoogleGenAI({ apiKey: API_KEY, httpOptions: { timeout: 60000 } });

// Send one prompt to Gemini and get plain text back
export async function askGemini(input, systemInstruction) {
  const interaction = await ai.interactions.create({
    model: MODEL,
    input,
    system_instruction: systemInstruction,
    store: false, // students' notes are not kept on Google's servers
  });
  return interaction.output_text;
}
