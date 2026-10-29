import { api } from "./api.js";

const log = document.querySelector("#chat-log");

// One chat bubble; an answer also lists the PDFs it used
function messageItem({ role, content, sources = [] }) {
  const item = document.createElement("li");
  item.className = role; // "user" or "assistant": the CSS puts them right or left
  const text = document.createElement("p");
  text.textContent = content;
  item.append(text);
  if (sources.length > 0) {
    const list = document.createElement("small");
    const names = sources.map((source) => `[${source.number}] ${source.filename}`);
    list.textContent = `Sources: ${names.join(", ")}`;
    item.append(list);
  }
  return item;
}

function scrollToEnd() {
  log.scrollTop = log.scrollHeight; // newest message in view
}

// Show the saved chat (after a page reload too)
export async function loadChat() {
  const messages = await api("/chat");
  log.replaceChildren(...messages.map(messageItem));
  scrollToEnd();
}

export async function sendMessage(message) {
  log.append(messageItem({ role: "user", content: message }));
  const thinking = messageItem({ role: "assistant", content: "Reading your notes..." });
  log.append(thinking);
  scrollToEnd();
  try {
    const { answer, sources } = await api("/chat", { method: "POST", json: { message } });
    thinking.replaceWith(messageItem({ role: "assistant", content: answer, sources }));
    scrollToEnd();
  } catch (error) {
    thinking.remove();
    throw error; // run() shows the error message
  }
}

export async function clearChat() {
  log.replaceChildren(); // empty the screen first, then the database
  await api("/chat", { method: "DELETE" });
}
