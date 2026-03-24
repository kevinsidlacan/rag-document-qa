import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from rag_backend.routes.upload import router as upload_router
from rag_backend.routes.chat import router as chat_router

app = FastAPI(title="RAG Document Q&A")

_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


def dev():
    """Entry point for `uv run dev`."""
    import uvicorn

    uvicorn.run("rag_backend.main:app", reload=True, port=3001)
