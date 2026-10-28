import { api } from "./api.js";

const results = document.querySelector("#search-results");

// One result: which PDF, how close the meaning is, and the matching text
function resultItem(result) {
  const item = document.createElement("li");
  const heading = document.createElement("strong");
  heading.textContent = `📄 ${result.filename} · match ${result.score.toFixed(2)}`;
  const text = document.createElement("p");
  text.textContent = result.text.length > 300 ? `${result.text.slice(0, 300)}...` : result.text;
  item.append(heading, text);
  return item;
}

// Ask the server for the chunks closest in meaning to the question
export async function searchNotes(query) {
  const loading = document.createElement("li");
  loading.className = "muted";
  loading.textContent = "Searching... (the first search after an upload takes longer)";
  results.replaceChildren(loading);
  const data = await api("/search", { method: "POST", json: { query, limit: 5 } });
  if (data.results.length === 0) {
    loading.textContent = "Nothing to search yet: upload a PDF first.";
    return;
  }
  results.replaceChildren(...data.results.map(resultItem));
}
