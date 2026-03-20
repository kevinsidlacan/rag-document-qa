from openai import OpenAI

from rag_backend.config import OPENAI_API_KEY, EMBEDDING_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using OpenAI."""
    response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    return [item.embedding for item in response.data]


def get_embedding(text: str) -> list[float]:
    """Generate an embedding for a single text."""
    return get_embeddings([text])[0]
