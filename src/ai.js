import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY;
// One or more model names, comma separated: the first is tried first
const MODELS = (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite").split(",").map((m) => m.trim());
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";

// Stop the server at startup if the key is missing (same idea as JWT_SECRET)
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Add it to .env (on a host: to its environment variables).");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Per model: wait at most 40 seconds, no automatic retries (we try the next model instead)
const REQUEST_OPTIONS = { timeout: 40000, maxRetries: 0 };

// Try each model in order. Busy, slow or missing model → try the next one.
// A wrong key (400/401/403) fails at once: another model would not help.
async function createInteraction(request) {
  for (const [i, model] of MODELS.entries()) {
    try {
      return await ai.interactions.create({ ...request, model, store: false }, REQUEST_OPTIONS);
    } catch (error) {
      const isLastModel = i === MODELS.length - 1;
      if (isLastModel || [400, 401, 403].includes(error.status)) throw error;
      console.warn(`Gemini: ${model} failed (${error.status ?? error.name}), trying ${MODELS[i + 1]}`);
    }
  }
}

// Send one prompt to Gemini and get plain text back
export async function askGemini(input, systemInstruction) {
  const interaction = await createInteraction({ input, system_instruction: systemInstruction });
  return interaction.output_text;
}

// Ask for JSON in an exact shape (a zod schema); throws if the answer does not fit
export async function askGeminiJson(input, systemInstruction, schema) {
  const interaction = await createInteraction({
    input,
    system_instruction: systemInstruction,
    response_format: { type: "text", mime_type: "application/json", schema: z.toJSONSchema(schema) },
  });
  return schema.parse(JSON.parse(interaction.output_text)); // never trust AI output blindly
}

// Turn texts into vectors (768 numbers each) that capture their meaning
// taskType: "RETRIEVAL_DOCUMENT" for notes we store, "RETRIEVAL_QUERY" for a question
export async function embedTexts(texts, taskType) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { taskType, outputDimensionality: 768, httpOptions: { timeout: 40000 } },
  });
  return response.embeddings.map((embedding) => embedding.values);
}

// One place that turns any AI failure into a friendly HTTP answer
export function sendAiError(res, error) {
  console.error("Gemini error:", error.status, error.message);
  if (error.status === 429) {
    return res.status(429).json({ error: "AI limit reached. Wait a minute and try again." });
  }
  res.status(502).json({ error: "The AI could not answer right now. Please try again." });
}
