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

class DocumentCreate(DocumentBase):
    pass

class DocumentRead(DocumentBase):
    id: uuid.UUID
    created_at: datetime
