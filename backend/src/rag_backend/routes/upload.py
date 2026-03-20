import re
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
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def sanitize_filename(filename: str) -> str:
    """Strip path components and remove unsafe characters."""
    # Take only the final path component (防 ../../etc/passwd)
    name = Path(filename).name
    # Keep only alphanumeric, hyphens, underscores, dots, spaces
    name = re.sub(r"[^\w\-. ]", "_", name)
    # Collapse repeated underscores/dots
    name = re.sub(r"[_.]{2,}", "_", name)
    return name or "unknown"


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a document: parse → chunk → embed → store in Pinecone."""
    filename = sanitize_filename(file.filename or "unknown")
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    # Read content with size limit
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB")

    # Save to temp file for parsing
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
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
