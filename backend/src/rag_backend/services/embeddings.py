from openai import OpenAI

from rag_backend.config import OPENAI_API_KEY, EMBEDDING_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


EMBEDDING_BATCH_SIZE = 100


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using OpenAI, batched to avoid API limits."""
    all_embeddings: list[list[float]] = []
    for i in range(0, len(texts), EMBEDDING_BATCH_SIZE):
        batch = texts[i : i + EMBEDDING_BATCH_SIZE]
        response = client.embeddings.create(input=batch, model=EMBEDDING_MODEL)
        all_embeddings.extend(item.embedding for item in response.data)
    return all_embeddings


def get_embedding(text: str) -> list[float]:
    """Generate an embedding for a single text."""
    return get_embeddings([text])[0]
