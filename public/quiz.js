import { api } from "./api.js";

const intro = document.querySelector("#quiz-intro");
const form = document.querySelector("#quiz-form");
let currentQuiz = null; // { id, filename, questions } of the quiz on screen

// One question: a fieldset with the question and 4 radio buttons
function questionBlock(question, i) {
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = `${i + 1}. ${question.question}`;
  fieldset.append(legend);
  question.options.forEach((option, j) => {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `q${i}`; // same name = only one option can be picked
    radio.value = j;
    label.append(radio, option); // append(text) adds plain text, never HTML
    fieldset.append(label);
  });
  return fieldset;
}

// Ask the server for a new quiz on one PDF and show it as a form
export async function startQuiz(doc) {
  form.hidden = true;
  intro.textContent = `Gemini is writing 5 questions from ${doc.filename}... (up to a minute)`;
  try {
    currentQuiz = await api("/quizzes", { method: "POST", json: { documentId: doc.id, count: 5 } });
  } catch (error) {
    intro.textContent = "No quiz this time.";
    throw error; // run() shows the error message
  }
  intro.textContent = `Quiz on ${currentQuiz.filename}: pick one answer per question.`;
  form.replaceChildren(...currentQuiz.questions.map(questionBlock));
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit answers";
  form.append(submit);
  form.hidden = false;
}

// Send the chosen answers; the server scores them and explains each one
export async function submitQuiz() {
  const answers = currentQuiz.questions.map((question, i) => {
    const checked = form.querySelector(`input[name="q${i}"]:checked`);
    return checked ? Number(checked.value) : null; // null = skipped
  });
  const result = await api(`/quizzes/${currentQuiz.id}/submit`, { method: "POST", json: { answers } });
  intro.textContent = `Score: ${result.score} / ${result.total}`;
  form.querySelectorAll("fieldset").forEach((fieldset, i) => {
    const { correct, answerIndex, explanation } = result.results[i];
    const feedback = document.createElement("p");
    feedback.className = correct ? "right" : "wrong";
    const rightOption = currentQuiz.questions[i].options[answerIndex];
    feedback.textContent = `${correct ? "Correct" : "Wrong"} (answer: ${rightOption}) ${explanation}`;
    fieldset.append(feedback);
  });
  form.querySelector("button").remove(); // one attempt per quiz
}
