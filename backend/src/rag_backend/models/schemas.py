from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., max_length=2000)


class Source(BaseModel):
    filename: str
    chunk_index: int
    score: float
    text: str


class UploadResponse(BaseModel):
    filename: str
    chunk_count: int
    message: str


class TextChunk(BaseModel):
    text: str
    chunk_index: int
    filename: str
    start_char: int
    end_char: int
