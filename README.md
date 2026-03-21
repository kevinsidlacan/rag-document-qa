# RAG Document Q&A — Upload and chat with your documents

Built to learn RAG pipelines end-to-end: document parsing, chunking, embedding, vector search, and streamed LLM responses — all wired together in a full-stack app.

Upload PDFs, DOCX, TXT, or Markdown files and ask questions about their contents. The FastAPI backend parses and chunks documents, embeds them via OpenAI, stores vectors in Pinecone, and streams answers back using SSE. The React frontend reads that stream in real-time and shows source citations alongside each response.

## Tech stack

**Backend** — Python 3.13, FastAPI, OpenAI (`text-embedding-3-small` + `gpt-4o-mini`), Pinecone, PyMuPDF, python-docx, uv

**Frontend** — React 19, TypeScript, Tailwind CSS v4, Vite

## How it works

**Upload flow**
```
PDF/DOCX/TXT/MD → parse text (PyMuPDF / python-docx / built-in)
               → split into ~1000-char chunks with overlap
               → embed all chunks (OpenAI) → upsert into Pinecone
```

**Chat flow**
```
question → embed query → search Pinecone (top 5 chunks)
                       → build prompt with retrieved context → stream GPT response via SSE
```

The SSE stream sends sources first, then streams tokens, so citations appear before the answer finishes.

## Design decisions

- **Lazy Pinecone connection** — connects on first use, not at import, so the app starts instantly and tests don't need a live index
- **Sources-first SSE ordering** — the stream sends source citations before any tokens, so the UI can show what documents are being referenced while the answer is still generating
- **Recursive chunking with boundary detection** — splits on paragraphs/sentences before falling back to character limits, keeping chunks semantically coherent
- **Client + server file validation** — file size (10MB) and type checks run on both sides, with filename sanitization on the backend to prevent path traversal
- **Input validation** — query length limits and structured error events in the SSE stream for graceful failure handling

## Prerequisites

- Python 3.13+ and [uv](https://docs.astral.sh/uv/)
- Node.js 18+
- OpenAI API key
- Pinecone account with an index created:
  - Dimension: `1536`
  - Metric: `cosine`

## Setup

**1. Clone and configure environment**

```bash
cp backend/.env.example backend/.env
# Fill in OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME
```

**2. Install backend dependencies**

```bash
cd backend
uv sync
```

**3. Install frontend dependencies**

```bash
cd frontend
npm install
```

## Running

**Backend** (port 3001):
```bash
cd backend
uv run uvicorn rag_backend.main:app --reload --app-dir src --port 3001
```

**Frontend** (port 5173):
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` — the Vite dev server proxies `/api` to the backend.

API docs at `http://localhost:3001/docs`.

## Project structure

```
backend/
  src/rag_backend/
    config.py          # env var loading
    main.py            # FastAPI app, CORS, routes
    models/schemas.py  # Pydantic request/response models
    services/
      document_parser.py  # PDF/DOCX/text extraction
      chunker.py          # recursive text splitting with overlap
      embeddings.py       # OpenAI embedding wrapper
      vector_store.py     # Pinecone upsert + search
      llm.py              # streaming GPT responses with RAG prompt
    routes/
      upload.py           # POST /api/upload
      chat.py             # POST /api/chat (SSE)

frontend/
  src/
    hooks/useChat.ts          # SSE stream reader, message state
    components/
      ChatWindow.tsx          # main layout
      FileUpload.tsx          # drag-and-drop upload
      MessageBubble.tsx       # user/assistant messages
      SourceCitation.tsx      # expandable source cards
      StreamingText.tsx       # text with streaming cursor
```
