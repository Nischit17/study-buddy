# Study Buddy API

Reference code for **Modern GenAI & Backend Systems** (5th sem, 2026-27).
Study Buddy is an AI study assistant: upload notes, chat with them, and generate quizzes.
This repo grows class by class.

## Checkpoints

| Branch | State |
|---|---|
| `class-01-end` | Notes REST API (Express, in-memory data) |
| `class-02-end` | Notes stored in SQLite, `.env` config, routes/model/schema files, zod validation |
| `class-03-end` | User accounts: register, login, bcrypt password hashing, JWT, private notes per user |
| `class-04-end` | PDF upload with multer, text extraction with pdf-parse, documents API |
| `class-05-end` | Website in `public/` (HTML, CSS, JavaScript fetch) served by Express: login, notes, PDF upload |
| `class-06-end` | Gemini AI (Interactions API, `@google/genai`): summarise an uploaded PDF from the website |
| `class-07-end` | AI multiple-choice quizzes (structured JSON output checked with zod), server-side scoring, score history, model fallback |
| `class-08-end` | Search by meaning: PDFs split into chunks, Gemini embeddings, cosine similarity |

## Run it

Requires Node.js 22 or newer.

```bash
git clone https://github.com/Nischit17/study-buddy.git checkpoint
cd checkpoint
git checkout class-08-end
npm install
cp .env.example .env
npm run dev
```

On Windows Command Prompt use `copy .env.example .env` instead of `cp`. Then put your own long random value in `JWT_SECRET`, and your free Gemini API key from https://aistudio.google.com/apikey in `GEMINI_API_KEY`.

The server starts at http://localhost:3000. Open that address in your browser to use the website.

## Endpoints

All `/api/notes`, `/api/documents`, `/api/quizzes`, `/api/search` and `/api/subjects` routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`), returns a token |
| POST | `/api/auth/login` | Log in (`email`, `password`), returns a token |
| GET | `/api/auth/me` | The logged-in user |
| GET | `/api/health` | Server status |
| GET | `/api/notes` | List notes (`?subject=OS` and/or `?search=word`) |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create a note (`title`, `content`, optional `subject`) |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/subjects` | List of unique subjects |
| POST | `/api/documents` | Upload a PDF (form-data field `file`, max 5 MB), extracts its text |
| GET | `/api/documents` | List your documents (without text) |
| GET | `/api/documents/:id` | One document with its extracted text |
| POST | `/api/documents/:id/summary` | AI summary of a document (Gemini) |
| DELETE | `/api/documents/:id` | Delete a document |
| POST | `/api/quizzes` | New AI quiz from a document (`documentId`, optional `count` 3–10) |
| POST | `/api/quizzes/:id/submit` | Submit `answers` (option numbers, `null` = skipped), get score and explanations |
| GET | `/api/quizzes/history` | Your submitted quizzes with scores |
| POST | `/api/search` | Search your PDFs by meaning (`query`, optional `limit` 1–10); the first search indexes new PDFs |

## Website

Express serves the files in `public/` (`app.use(express.static("public"))`), so the website and the API share one address and no CORS setup is needed.

| File | Job |
|---|---|
| `public/index.html` + `login.js` | Log in or create an account; the token is saved in `localStorage` |
| `public/app.html` + `app.js` | Your PDFs and notes: upload, add, delete |
| `public/api.js` | One `api()` function that calls the backend with the token |
| `public/style.css` | All the styling |
