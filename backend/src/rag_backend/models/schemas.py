from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Query must not be blank")
        return stripped


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
