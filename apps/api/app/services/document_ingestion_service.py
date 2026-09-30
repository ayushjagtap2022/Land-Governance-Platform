"""Safe, deterministic extraction and chunking for repository evidence ingestion."""

from __future__ import annotations

import hashlib
import io
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pypdf


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".csv", ".geojson", ".json"}
MAX_FILE_BYTES = 25 * 1024 * 1024


@dataclass(frozen=True)
class ExtractedPage:
    page_number: int
    text: str


@dataclass(frozen=True)
class ExtractedChunk:
    page_number: int
    chunk_index: int
    content: str
    content_sha256: str


class DocumentIngestionError(ValueError):
    pass


def validate_upload(filename: str, content: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise DocumentIngestionError(f"Unsupported file type '{suffix or 'unknown'}'. Allowed types: {allowed}.")
    if not content:
        raise DocumentIngestionError("Uploaded file is empty.")
    if len(content) > MAX_FILE_BYTES:
        raise DocumentIngestionError("Uploaded file exceeds the 25 MB repository limit.")
    return suffix


def extract_pages(filename: str, content: bytes) -> list[ExtractedPage]:
    suffix = validate_upload(filename, content)
    if suffix == ".pdf":
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages = [ExtractedPage(index + 1, (page.extract_text() or "").strip()) for index, page in enumerate(reader.pages)]
        except Exception as exc:
            raise DocumentIngestionError("The PDF could not be read. Upload a valid text-based PDF or process it through OCR.") from exc
    else:
        text = content.decode("utf-8", errors="replace").strip()
        pages = [ExtractedPage(1, text)]

    usable = [page for page in pages if page.text]
    if not usable:
        raise DocumentIngestionError("No extractable text was found. OCR processing is required before this document can be indexed.")
    return usable


def chunk_pages(pages: Iterable[ExtractedPage], chunk_size: int = 1200, overlap: int = 180) -> list[ExtractedChunk]:
    """Split text on whitespace while retaining exact page attribution."""
    if chunk_size <= overlap:
        raise ValueError("chunk_size must be larger than overlap")

    chunks: list[ExtractedChunk] = []
    index = 0
    for page in pages:
        normalized = re.sub(r"\s+", " ", page.text).strip()
        start = 0
        while start < len(normalized):
            end = min(len(normalized), start + chunk_size)
            if end < len(normalized):
                boundary = normalized.rfind(" ", start, end)
                if boundary > start:
                    end = boundary
            body = normalized[start:end].strip()
            if body:
                chunks.append(ExtractedChunk(
                    page_number=page.page_number,
                    chunk_index=index,
                    content=body,
                    content_sha256=hashlib.sha256(body.encode("utf-8")).hexdigest(),
                ))
                index += 1
            if end >= len(normalized):
                break
            start = max(end - overlap, start + 1)
    return chunks


def sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()
