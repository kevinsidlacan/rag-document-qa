from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from rag_backend.routes.upload import router as upload_router

app = FastAPI(title="RAG Document Q&A")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
