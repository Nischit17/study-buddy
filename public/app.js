import { api, getToken, clearToken } from "./api.js";
import { startQuiz, submitQuiz } from "./quiz.js";
import { searchNotes } from "./search.js";
import { loadChat, sendMessage, clearChat } from "./chat.js";

// No token? Back to the login page
if (!getToken()) window.location.href = "/";

const message = document.querySelector("#message");

function logout() {
  clearToken();
  window.location.href = "/";
}

// Runs a task and shows any error; an expired token (401) logs you out
async function run(task) {
  try {
    await task();
  } catch (error) {
    if (error.status === 401) return logout();
    message.textContent = error.message;
  }
}

// Fills a <ul> with one <li> per item; buttons = [{ label, onClick }, ...]
function renderList(selector, items, toText, buttons) {
  const list = document.querySelector(selector);
  list.replaceChildren(); // remove the old items
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "Nothing here yet";
    list.append(empty);
  }
  for (const item of items) {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = toText(item); // textContent, never innerHTML: text stays text
    li.append(text);
    for (const { label, onClick } of buttons) {
      const button = document.createElement("button");
      button.className = "secondary";
      button.textContent = label;
      button.addEventListener("click", () => run(() => onClick(item)));
      li.append(button);
    }
    list.append(li);
  }
}

async function summariseDocument(doc) {
  const box = document.querySelector("#summary");
  box.textContent = `Gemini is reading ${doc.filename}...`;
  try {
    const { summary } = await api(`/documents/${doc.id}/summary`, { method: "POST" });
    box.textContent = summary; // AI text is user-like data: textContent, never innerHTML
  } catch (error) {
    box.textContent = "No summary this time.";
    throw error; // run() shows the error message
  }
}

async function deleteDocument(doc) {
  await api(`/documents/${doc.id}`, { method: "DELETE" });
  await loadDocuments();
}

async function loadDocuments() {
  const documents = await api("/documents");
  const toText = (doc) => `📄 ${doc.filename} · ${doc.pages} pages`;
  renderList("#document-list", documents, toText, [
    { label: "Summarise", onClick: summariseDocument },
    { label: "Quiz", onClick: startQuiz },
    { label: "Delete", onClick: deleteDocument },
  ]);
}

async function deleteNote(note) {
  await api(`/notes/${note.id}`, { method: "DELETE" });
  await loadNotes();
}

async function loadNotes() {
  const notes = await api("/notes");
  const toText = (note) => `[${note.subject}] ${note.title}`;
  renderList("#note-list", notes, toText, [{ label: "Delete", onClick: deleteNote }]);
}

document.querySelector("#upload-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  run(async () => {
    message.textContent = "Uploading and reading your PDF...";
    const doc = await api("/documents", { method: "POST", formData: new FormData(form) });
    message.textContent = `Uploaded ${doc.filename}: ${doc.characters} characters of text found`;
    form.reset();
    await loadDocuments();
  });
});

document.querySelector("#note-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  run(async () => {
    await api("/notes", { method: "POST", json: Object.fromEntries(new FormData(form)) });
    message.textContent = "Note saved";
    form.reset();
    await loadNotes();
  });
});

async function loadHistory() {
  const history = await api("/quizzes/history");
  const toText = (quiz) => `${quiz.filename}: ${quiz.score} / ${quiz.total}`;
  renderList("#history-list", history, toText, []);
}

document.querySelector("#quiz-form").addEventListener("submit", (event) => {
  event.preventDefault();
  run(async () => {
    await submitQuiz();
    await loadHistory();
  });
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(event.target).get("query");
  run(() => searchNotes(query));
});

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const message = new FormData(form).get("message");
  form.reset(); // empty the box at once, like a chat app
  run(() => sendMessage(message));
});

document.querySelector("#clear-chat").addEventListener("click", () => run(clearChat));

document.querySelector("#logout-button").addEventListener("click", logout);

// Page start: say hello, then load the lists and the chat
run(async () => {
  const user = await api("/auth/me");
  document.querySelector("#user-name").textContent = `Hi, ${user.name}`;
  await loadDocuments();
  await loadNotes();
  await loadHistory();
  await loadChat();
});
