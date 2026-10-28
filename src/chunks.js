// Small pieces search better than whole PDFs: one chunk ≈ one idea
const MAX_WORDS = 60;

const countWords = (text) => text.split(" ").length;

// Cut the text into sentences, then group sentences into chunks of at most 60 words
export function splitIntoChunks(text) {
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.?!]) /); // split after . ? !
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && countWords(`${current} ${sentence}`) > MAX_WORDS) {
      chunks.push(current); // this chunk is full: start a new one
      current = "";
    }
    current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) chunks.push(current); // the last, partly full chunk
  return chunks;
}

// Cosine similarity: 1 = same meaning, around 0.5 or less = unrelated
export function cosineSimilarity(a, b) {
  let dot = 0, lengthA = 0, lengthB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    lengthA += a[i] * a[i];
    lengthB += b[i] * b[i];
  }
  return dot / (Math.sqrt(lengthA) * Math.sqrt(lengthB));
}
