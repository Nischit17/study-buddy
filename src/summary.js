import { askGemini } from "./ai.js";

// The system instruction: who the AI is and the rules it must follow
const SUMMARY_INSTRUCTION = `You are Study Buddy, a tutor for engineering students.
Summarise the student's notes for quick revision.
Rules:
- Use only the information in the notes. Never add facts that are not there.
- Write plain text. Do not use Markdown symbols such as ** or #.
- Start with one sentence saying what the notes are about.
- Then give 4 to 6 key points, each on its own line starting with "- ".
- End with one line: "Remember: " followed by the single most important idea.`;

// Long PDFs are cut so the prompt stays small (and fast, and inside free limits)
const MAX_CHARACTERS = 20000;

export function summariseNotes(text) {
  const notes = text.slice(0, MAX_CHARACTERS);
  return askGemini(`Notes:\n"""\n${notes}\n"""`, SUMMARY_INSTRUCTION);
}
