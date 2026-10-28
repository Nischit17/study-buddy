import { z } from "zod";
import { askGeminiJson } from "./ai.js";

// The exact JSON shape we want from Gemini (also used to check its answer)
const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      options: z.array(z.string().min(1)).length(4),
      answerIndex: z.number().int().min(0).max(3),
      explanation: z.string().min(1),
    })
  ),
});

const QUIZ_INSTRUCTION = `You are Study Buddy, an examiner for engineering students.
Write multiple-choice questions from the student's notes.
Rules:
- Every question must be answerable from the notes alone.
- Exactly 4 options per question, and only one of them is correct.
- Wrong options must be believable, not silly.
- answerIndex is the position of the correct option: 0, 1, 2 or 3.
- The explanation says in one sentence why the correct answer is right.`;

const MAX_CHARACTERS = 20000;

// LLMs often put the right answer in the same position, so we shuffle ourselves
function shuffleOptions({ question, options, answerIndex, explanation }) {
  const correct = options[answerIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap two items
  }
  return { question, options: shuffled, answerIndex: shuffled.indexOf(correct), explanation };
}

export async function generateQuiz(text, count) {
  const notes = text.slice(0, MAX_CHARACTERS);
  const input = `Write exactly ${count} questions.\nNotes:\n"""\n${notes}\n"""`;
  const { questions } = await askGeminiJson(input, QUIZ_INSTRUCTION, quizSchema);
  return questions.slice(0, count).map(shuffleOptions);
}
