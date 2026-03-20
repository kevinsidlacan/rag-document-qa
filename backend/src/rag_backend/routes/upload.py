import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from rag_backend.models.schemas import UploadResponse
from rag_backend.services.document_parser import parse_document
from rag_backend.services.chunker import chunk_text
from rag_backend.services.embeddings import get_embeddings
from rag_backend.services.vector_store import upsert_chunks

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a document: parse → chunk → embed → store in Pinecone."""
    filename = file.filename or "unknown"
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    # Save to temp file for parsing
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text, _metadata = parse_document(tmp_path, filename)
        chunks = chunk_text(text, filename)

        if not chunks:
            raise HTTPException(400, "No text content found in document")

        # Embed all chunks
        texts = [c.text for c in chunks]
        embeddings = get_embeddings(texts)

        # Store in Pinecone
        upsert_chunks(chunks, embeddings)

        return UploadResponse(
            filename=filename,
            chunk_count=len(chunks),
            message=f"Successfully processed {filename} into {len(chunks)} chunks",
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)
