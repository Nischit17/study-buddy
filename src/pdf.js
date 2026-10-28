import { PDFParse } from "pdf-parse";

// Turn the bytes of a PDF into plain text
export async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = result.text
      .replace(/^-- \d+ of \d+ --$/gm, "") // remove the "-- 1 of 2 --" page markers
      .replace(/\n{3,}/g, "\n\n") // squeeze big gaps into one blank line
      .trim();
    return { text, pages: result.total };
  } finally {
    await parser.destroy(); // always free memory, even if reading failed
  }
}
