import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sentences = [
  "Two processes are stuck forever, each waiting for the other",
  "A deadlock happens when processes wait for each other's resources",
  "Paging divides memory into fixed-size frames",
  "My favourite food is masala dosa",
];

// One request, four sentences → four lists of numbers (vectors)
const response = await ai.models.embedContent({
  model: "gemini-embedding-001",
  contents: sentences,
  config: { outputDimensionality: 768 },
});
const vectors = response.embeddings.map((embedding) => embedding.values);
console.log("Numbers per sentence:", vectors[0].length);
console.log("First five numbers of sentence 1:", vectors[0].slice(0, 5));

// Cosine similarity: 1 = same direction (same meaning), near 0 = unrelated
function cosineSimilarity(a, b) {
  let dot = 0, lengthA = 0, lengthB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    lengthA += a[i] * a[i];
    lengthB += b[i] * b[i];
  }
  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}

// Compare sentence 1 with every sentence
for (const [i, sentence] of sentences.entries()) {
  console.log(cosineSimilarity(vectors[0], vectors[i]).toFixed(3), sentence);
}
