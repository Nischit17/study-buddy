import { embedTexts } from "./ai.js";
import { splitIntoChunks, cosineSimilarity } from "./chunks.js";
import { findUnindexedDocuments, saveChunks, findUserChunks } from "./chunks.model.js";

// Gemini embeds at most 100 texts per request
const BATCH_SIZE = 100;

// Split one PDF into chunks, embed them, save them
export async function indexDocument(document) {
  const texts = splitIntoChunks(document.text);
  if (texts.length === 0) return 0; // a scanned PDF has no text to search
  const vectors = [];
  for (let start = 0; start < texts.length; start += BATCH_SIZE) {
    vectors.push(...(await embedTexts(texts.slice(start, start + BATCH_SIZE), "RETRIEVAL_DOCUMENT")));
  }
  saveChunks(document.id, texts, vectors);
  console.log(`Indexed ${document.filename}: ${texts.length} chunks`);
  return texts.length;
}

// Find the chunks whose meaning is closest to the question
export async function searchNotes(userId, query, limit) {
  for (const document of findUnindexedDocuments(userId)) {
    await indexDocument(document); // only the first search after an upload waits for this
  }
  const [queryVector] = await embedTexts([query], "RETRIEVAL_QUERY");
  return findUserChunks(userId)
    .map(({ embedding, ...chunk }) => ({ ...chunk, score: cosineSimilarity(queryVector, embedding) }))
    .sort((a, b) => b.score - a.score) // highest score first
    .slice(0, limit);
}
