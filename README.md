# Study Buddy API

Reference code for **Modern GenAI & Backend Systems** (5th sem, 2026-27).
Study Buddy is an AI study assistant: upload notes, chat with them, and generate quizzes.
This repo grows class by class.

## Checkpoints

| Branch | State |
|---|---|
| `class-01-end` | Notes REST API (Express, in-memory data) |

## Run it

Requires Node.js 22 or newer.

```bash
git clone https://github.com/Nischit17/study-buddy.git checkpoint
cd checkpoint
git checkout class-01-end
npm install
npm run dev
```

The server starts at http://localhost:3000.

## Endpoints (Class 1)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status |
| GET | `/api/notes` | List notes (`?subject=OS` to filter) |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create a note (`title`, `content`, optional `subject`) |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
