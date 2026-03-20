from collections.abc import AsyncGenerator

from openai import AsyncOpenAI

from rag_backend.config import OPENAI_API_KEY, LLM_MODEL

async_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the provided context.
Use ONLY the context below to answer. If the context doesn't contain enough information, say so.
Be concise and cite which document the information comes from when possible."""


async def stream_response(query: str, context_chunks: list[dict]) -> AsyncGenerator[str, None]:
    """Stream an LLM response token by token, with RAG context."""
    context = "\n\n---\n\n".join(
        f"[Source: {c['filename']}, chunk {c['chunk_index']}]\n{c['text']}"
        for c in context_chunks
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {query}",
        },
    ]

    stream = await async_client.chat.completions.create(
        model=LLM_MODEL,
        messages=messages,
        stream=True,
        temperature=0.3,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:
            yield delta.content
