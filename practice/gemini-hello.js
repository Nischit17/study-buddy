import { GoogleGenAI } from "@google/genai";

// The key comes from .env (run with: node --env-file=.env practice/gemini-hello.js)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const interaction = await ai.interactions.create({
  model: "gemini-3.1-flash-lite",
  input: "Explain a deadlock in operating systems in one sentence.",
  system_instruction: "You are a friendly tutor for engineering students. Use simple English.",
  store: false, // do not keep this conversation on Google's servers
});

console.log("Answer:", interaction.output_text);
console.log("Tokens in:", interaction.usage.total_input_tokens);
console.log("Tokens out:", interaction.usage.total_output_tokens);
