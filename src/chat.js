import { askGemini } from "./ai.js";
import { searchNotes } from "./search.js";

// Found by testing: unrelated ≈ 0.45, vague follow-ups ≈ 0.58, on-topic chunks 0.62 and up
const MIN_SCORE = 0.6;
const NOT_FOUND = "I could not find this in your notes. Try other words, or upload notes on this topic.";

const CHAT_INSTRUCTION = `You are Study Buddy, a tutor for engineering students.
Answer the student's question using only the numbered sources from their notes.
Rules:
- If the sources do not answer the question, say: "I could not find this in your notes."
- After each fact, write the number of its source in square brackets, like [1] or [2].
- Keep the answer under 150 words. Plain text, no Markdown.`;

// R of RAG: find the best chunks; a follow-up ("what about its conditions?") also uses the last question
async function findSources(userId, question, history) {
  let chunks = await searchNotes(userId, question, 5);
  const lastQuestion = history.findLast((message) => message.role === "user")?.content;
  if (chunks[0]?.score < MIN_SCORE && lastQuestion) {
    chunks = await searchNotes(userId, `${lastQuestion} ${question}`, 5);
  }
  return chunks.filter((chunk) => chunk.score >= MIN_SCORE);
}

// A + G of RAG: put the sources into the prompt, let Gemini write the answer
export async function answerQuestion(userId, question, history) {
  const sources = await findSources(userId, question, history);
  if (sources.length === 0) return { answer: NOT_FOUND, sources: [] }; // no AI call: nothing to answer from

  const sourceText = sources.map((source, i) => `[${i + 1}] (${source.filename}) ${source.text}`).join("\n\n");
  const conversation = history
    .map((message) => `${message.role === "user" ? "Student" : "Study Buddy"}: ${message.content}`)
    .join("\n");
  const input = `Sources:\n"""\n${sourceText}\n"""\n\nConversation so far:\n${conversation || "(none)"}\n\nStudent: ${question}`;
  const answer = await askGemini(input, CHAT_INSTRUCTION);
  return {
    answer,
    sources: sources.map((source, i) => ({
      number: i + 1,
      filename: source.filename,
      score: Number(source.score.toFixed(3)),
      text: source.text,
    })),
  };
}
