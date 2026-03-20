import json
import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from rag_backend.models.schemas import ChatRequest, Source
from rag_backend.services.embeddings import get_embedding
from rag_backend.services.vector_store import search
from rag_backend.services.llm import stream_response

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """Embed query → search Pinecone → stream LLM response via SSE."""
    # 1. Embed the query
    query_embedding = get_embedding(request.query)

    # 2. Search for relevant chunks
    results = search(query_embedding, top_k=5)

    # 3. Stream the response as SSE
    async def event_stream():
        try:
            # Send sources first
            sources = [
                Source(
                    filename=r["filename"],
                    chunk_index=r["chunk_index"],
                    score=r["score"],
                    text=r["text"],
                )
                for r in results
            ]
            yield f"event: sources\ndata: {json.dumps([s.model_dump() for s in sources])}\n\n"

            # Stream LLM tokens
            async for token in stream_response(request.query, results):
                yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"

            yield "event: done\ndata: {}\n\n"
        except Exception as e:
            logger.exception("Error during SSE stream")
            yield f"event: error\ndata: {json.dumps({'message': 'An error occurred while generating the response.'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
