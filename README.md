# Study Buddy API

Reference code for **Modern GenAI & Backend Systems** (5th sem, 2026-27).
Study Buddy is an AI study assistant: upload notes, chat with them, and generate quizzes.
This repo grows class by class.

## Checkpoints

| Branch | State |
|---|---|
| `class-01-end` | Notes REST API (Express, in-memory data) |
| `class-02-end` | Notes stored in SQLite, `.env` config, routes/model/schema files, zod validation |

## Run it

Requires Node.js 22 or newer.

```bash
git clone https://github.com/Nischit17/study-buddy.git checkpoint
cd checkpoint
git checkout class-02-end
npm install
cp .env.example .env
npm run dev
```

On Windows Command Prompt use `copy .env.example .env` instead of `cp`.

The server starts at http://localhost:3000.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status |
| GET | `/api/notes` | List notes (`?subject=OS` and/or `?search=word`) |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create a note (`title`, `content`, optional `subject`) |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/subjects` | List of unique subjects |
