import { api, getToken, clearToken } from "./api.js";

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

// Fills a <ul> with one <li> per item, each with a Delete button
function renderList(selector, items, toText, onDelete) {
  const list = document.querySelector(selector);
  list.replaceChildren(); // remove the old items
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "Nothing here yet";
    list.append(empty);
  }
  for (const item of items) {
    const text = document.createElement("span");
    text.textContent = toText(item); // textContent, never innerHTML: text stays text
    const button = document.createElement("button");
    button.className = "secondary";
    button.textContent = "Delete";
    button.addEventListener("click", () => run(() => onDelete(item)));
    const li = document.createElement("li");
    li.append(text, button);
    list.append(li);
  }
}

async function loadDocuments() {
  const documents = await api("/documents");
  const toText = (doc) => `📄 ${doc.filename} · ${doc.pages} pages`;
  renderList("#document-list", documents, toText, async (doc) => {
    await api(`/documents/${doc.id}`, { method: "DELETE" });
    await loadDocuments();
  });
}

async function loadNotes() {
  const notes = await api("/notes");
  const toText = (note) => `[${note.subject}] ${note.title}`;
  renderList("#note-list", notes, toText, async (note) => {
    await api(`/notes/${note.id}`, { method: "DELETE" });
    await loadNotes();
  });
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

document.querySelector("#logout-button").addEventListener("click", logout);

// Page start: say hello, then load both lists
run(async () => {
  const user = await api("/auth/me");
  document.querySelector("#user-name").textContent = `Hi, ${user.name}`;
  await loadDocuments();
  await loadNotes();
});
