import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector

class DocumentBase(SQLModel):
    title: str = Field(index=True)
    summary: Optional[str] = None
    department: str = Field(index=True)
    category: str = Field(index=True)
    status: str = Field(default="Verified")
    metadata_json: dict = Field(default={}, sa_column=Column(JSONB))

class Document(DocumentBase, table=True):
    __tablename__ = "documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(1024), nullable=True))
    spatial_coverage: Optional[str] = Field(default=None, sa_column=Column(Geometry("GEOMETRY", srid=4326), nullable=True))


class DocumentChunk(SQLModel, table=True):
    """A page-aware evidence passage extracted from an approved repository document."""
    __tablename__ = "document_chunks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    document_id: uuid.UUID = Field(foreign_key="documents.id", index=True)
    page_number: int = Field(default=1, ge=1)
    chunk_index: int = Field(default=0, ge=0)
    content: str
    content_sha256: str = Field(index=True)
    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(1024), nullable=True))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentCreate(DocumentBase):
    pass

class DocumentRead(DocumentBase):
    id: uuid.UUID
    created_at: datetime
