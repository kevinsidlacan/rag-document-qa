# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

**Backend** (from `backend/`):
```bash
uv run uvicorn rag_backend.main:app --reload --app-dir src --port 3001
```

**Frontend** (from `frontend/`):
```bash
npm run dev
```

API docs available at `http://localhost:3001/docs` when server is running.

## Backend architecture

Python 3.13 + FastAPI, managed with `uv`. Package lives at `backend/src/rag_backend/` (src layout — required by hatchling build config in `pyproject.toml`).

**RAG pipeline — two flows:**

*Ingest* (`POST /api/upload`):
```
UploadFile → document_parser → chunker → embeddings (batch) → vector_store.upsert
```

*Query* (`POST /api/chat`):
```
query → embeddings.get_embedding → vector_store.search → llm.stream_response → SSE stream
```

**Services** (`services/`):
- `document_parser.py` — PyMuPDF (`import fitz`), python-docx, plain text
- `chunker.py` — recursive char splitting with overlap, smart boundary detection
- `embeddings.py` — OpenAI `text-embedding-3-small`, sync client, single + batch
- `vector_store.py` — Pinecone, **lazy connection** (connects on first use, not at import)
- `llm.py` — async generator streaming via `AsyncOpenAI`, RAG prompt construction

**Chat SSE format** — 3 event types in order: `sources` → `token` (repeated) → `done`.

**Environment** (`backend/.env`):
```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=rag-docs
```

Pinecone index must be created manually with **dimension 1536** and **cosine metric** (matches `text-embedding-3-small`).

## Frontend architecture

React 19 + TypeScript + Tailwind CSS v4 + Vite. Tailwind is imported via `@import "tailwindcss"` in `index.css` using the `@tailwindcss/vite` plugin — **not** the PostCSS plugin.

Custom olive color scale is defined in `index.css` under `@theme` and used throughout as `olive-*` utilities.

**`useChat` hook** (`hooks/useChat.ts`) owns all chat state. It reads the SSE stream manually with `fetch` + `ReadableStream`, parsing `event:` / `data:` lines from the buffer. Sources arrive before tokens, so the UI can show citations before the response finishes.

Vite proxies `/api` → `http://localhost:3001` in dev (configured in `vite.config.ts`).

## Key gotchas

- `pinecone-client` was renamed to `pinecone` — the old package name throws at import time
- Backend package discovery requires `[tool.hatch.build.targets.wheel] packages = ["src/rag_backend"]` — without this, `uv sync` fails to build
- Run `uv sync` from `backend/` after any `pyproject.toml` dependency change
