from pinecone import Pinecone

from rag_backend.config import PINECONE_API_KEY, PINECONE_INDEX_NAME
from rag_backend.models.schemas import TextChunk

_index = None


def _get_index():
    global _index
    if _index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _index = pc.Index(PINECONE_INDEX_NAME)
    return _index


def upsert_chunks(chunks: list[TextChunk], embeddings: list[list[float]]) -> int:
    """Upsert text chunks with their embeddings into Pinecone."""
    index = _get_index()
    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vector_id = f"{chunk.filename}_{chunk.chunk_index}"
        vectors.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "text": chunk.text,
                "filename": chunk.filename,
                "chunk_index": chunk.chunk_index,
                "start_char": chunk.start_char,
                "end_char": chunk.end_char,
            },
        })

    # Pinecone recommends batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch)

    return len(vectors)


def search(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """Search for similar chunks by embedding vector."""
    index = _get_index()
    results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
    return [
        {
            "filename": match.metadata["filename"],
            "chunk_index": int(match.metadata["chunk_index"]),
            "score": match.score,
            "text": match.metadata["text"],
        }
        for match in results.matches
    ]
