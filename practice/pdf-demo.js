import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

// 1) Read the PDF file from disk into memory (a Buffer = raw bytes)
const buffer = await readFile("practice/sample-notes.pdf");
console.log("File size:", buffer.length, "bytes");

// 2) Extract the text
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
await parser.destroy(); // free the memory pdf-parse used

console.log("Pages:", result.total);
console.log("Characters:", result.text.length);
console.log("--- First 200 characters ---");
console.log(result.text.slice(0, 200));
