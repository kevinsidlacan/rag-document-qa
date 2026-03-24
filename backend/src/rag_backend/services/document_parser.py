from pathlib import Path

import fitz  # PyMuPDF
from docx import Document


def parse_document(file_path: str, original_filename: str) -> tuple[str, dict]:
    """Parse PDF, DOCX, TXT, or MD files. Returns (text, metadata)."""
    path = Path(file_path)
    suffix = Path(original_filename).suffix.lower()
    metadata = {"filename": original_filename, "file_type": suffix}

    match suffix:
        case ".pdf":
            text = _parse_pdf(path)
        case ".docx":
            text = _parse_docx(path)
        case ".txt" | ".md":
            text = path.read_text(encoding="utf-8")
        case _:
            raise ValueError(f"Unsupported file type: {suffix}")

    metadata["char_count"] = len(text)
    return text, metadata


def _parse_pdf(path: Path) -> str:
    with fitz.open(str(path)) as doc:
        return "\n".join(page.get_text() for page in doc)


def _parse_docx(path: Path) -> str:
    doc = Document(str(path))
    return "\n".join(para.text for para in doc.paragraphs)
