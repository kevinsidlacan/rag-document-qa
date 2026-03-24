from rag_backend.config import CHUNK_SIZE, CHUNK_OVERLAP
from rag_backend.models.schemas import TextChunk


def chunk_text(
    text: str,
    filename: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[TextChunk]:
    """Split text into overlapping chunks with position tracking."""
    if not text.strip():
        return []

    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be less than chunk_size")

    chunks: list[TextChunk] = []
    start = 0
    chunk_index = 0

    while start < len(text):
        end = start + chunk_size

        # Try to break at a sentence or paragraph boundary
        if end < len(text):
            # Look for the last newline or period within the chunk
            for sep in ["\n\n", "\n", ". ", " "]:
                break_point = text.rfind(sep, start + chunk_size // 2, end)
                if break_point != -1:
                    end = break_point + len(sep)
                    break

        chunk_text_str = text[start:end].strip()
        if chunk_text_str:
            chunks.append(
                TextChunk(
                    text=chunk_text_str,
                    chunk_index=chunk_index,
                    filename=filename,
                    start_char=start,
                    end_char=end,
                )
            )
            chunk_index += 1

        start = end - chunk_overlap
        if start >= len(text) or end >= len(text):
            break

    return chunks
