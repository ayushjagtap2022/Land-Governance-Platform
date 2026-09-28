import uuid
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from pgvector.sqlalchemy import Vector

class DocumentBase(SQLModel):
    title: str = Field(index=True)
    summary: Optional[str] = None
    department: str = Field(index=True)
    category: str = Field(index=True)
    status: str = Field(default="Pending")
    
    # Metadata stored as JSONB for flexibility
    metadata_json: dict = Field(default={}, sa_column=Column(JSONB))

class Document(DocumentBase, table=True):
    __tablename__ = "documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 1024-dim Embedding using pgvector (for BGE-M3)
    embedding: list[float] = Field(sa_column=Column(Vector(1024)))
    
    # Geospatial geometry (Point, Polygon, etc) using PostGIS via GeoAlchemy2
    # e.g., SRID 4326 is standard WGS 84
    spatial_coverage: Optional[str] = Field(default=None, sa_column=Column(Geometry("GEOMETRY", srid=4326)))

# You can also define models for response schemas here:
class DocumentCreate(DocumentBase):
    pass

class DocumentRead(DocumentBase):
    id: uuid.UUID
    created_at: datetime
