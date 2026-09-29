import os
import uuid
import hashlib
import numpy as np
from datetime import datetime, timezone
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.dependencies import get_db
from app.models.document import Document
from app.services.storage_service import storage_service
from app.services.ocr_service import ocr_service, ExtractedMetadata

router = APIRouter()

class CommitRecordRequest(BaseModel):
    title: str
    authority: str
    year: str
    theme: str
    administrative_level: str
    file_name: str
    file_url: str

def generate_embedding(text: str) -> List[float]:
    """Generates a normalized 1024-dim embedding vector for pgvector."""
    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (2**32)
    rng = np.random.default_rng(seed)
    vec = rng.standard_normal(1024)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

SEED_DOCUMENTS = [
    {
        "title": "National Land Records Modernisation Programme (DILRMP) Core Framework",
        "department": "Department of Land Resources",
        "category": "Policy",
        "summary": "Standard operating procedure for linking cadastral maps with digital Records of Rights (RoR). Mandates sub-5cm spatial precision for drone surveys.",
        "metadata_json": {
            "ref_id": "DILRMP-2024-001",
            "theme": "Cadastral Mapping",
            "state_region": "All India",
            "administrative_level": "National",
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": 2024,
            "published": "12 Jan 2024",
            "updated": "18 Jun 2024",
            "format": "PDF",
            "pages": 48,
            "version": "v2.1",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "SVAMITVA Scheme Guidelines: Drone Survey & Property Validation",
        "department": "Ministry of Panchayati Raj",
        "category": "Standard",
        "summary": "Technical and operational protocol for drone survey, Gram Sabha validation, and issuance of legal property cards.",
        "metadata_json": {
            "ref_id": "SVAMITVA-2024-014",
            "theme": "SVAMITVA Scheme",
            "state_region": "Maharashtra",
            "administrative_level": "State",
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": 2024,
            "published": "04 Mar 2024",
            "updated": "22 May 2024",
            "format": "PDF",
            "pages": 64,
            "version": "v1.3",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Model Agricultural Land Leasing Act & State Adoption Guidelines",
        "department": "NITI Aayog",
        "category": "Legislation",
        "summary": "Model legal framework enabling institutional credit for tenant farmers while protecting land ownership.",
        "metadata_json": {
            "ref_id": "LEASING-2023-009",
            "theme": "Tenancy Rights",
            "state_region": "Madhya Pradesh",
            "administrative_level": "State",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2023,
            "published": "18 Nov 2023",
            "updated": "14 Feb 2024",
            "format": "PDF",
            "pages": 32,
            "version": "v1.0",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Forest Rights Act (FRA) Title Verification Guidelines",
        "department": "Ministry of Tribal Affairs",
        "category": "Legislation",
        "summary": "Standard verification protocols for Individual and Community Forest Rights titles with spatial boundary demarcation.",
        "metadata_json": {
            "ref_id": "FRA-2023-018",
            "theme": "Climate Resilience",
            "state_region": "All India",
            "administrative_level": "National",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2023,
            "published": "09 Sep 2023",
            "updated": "11 Jan 2024",
            "format": "PDF",
            "pages": 52,
            "version": "v1.2",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Maharashtra Land Revenue Code Digital Mutation Rules",
        "department": "Revenue & Forest Department, Maharashtra",
        "category": "Legislation",
        "summary": "Notified procedures for fast-track dispute disposal and automated online mutation under the e-Mutation portal.",
        "metadata_json": {
            "ref_id": "MLRC-2024-007",
            "theme": "Land Dispute Resolution",
            "state_region": "Maharashtra",
            "administrative_level": "State",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2024,
            "published": "20 Feb 2024",
            "updated": "30 May 2024",
            "format": "PDF",
            "pages": 44,
            "version": "v2.0",
            "visibility": "Public / Verified Citation"
        }
    }
]

def format_document_dict(doc: Document) -> Dict[str, Any]:
    meta = doc.metadata_json or {}
    return {
        "id": str(doc.id),
        "ref_id": meta.get("ref_id", f"DOC-{str(doc.id)[:8]}"),
        "title": doc.title,
        "department": doc.department,
        "category": doc.category,
        "theme": meta.get("theme", "General"),
        "state_region": meta.get("state_region", "All India"),
        "administrative_level": meta.get("administrative_level", "National"),
        "document_type": meta.get("document_type", "Policy Paper"),
        "record_type": meta.get("record_type", "Policy Drafts"),
        "year": meta.get("year", 2024),
        "published": meta.get("published", doc.created_at.strftime("%d %b %Y")),
        "updated": meta.get("updated", "Recently"),
        "status": doc.status or "Verified",
        "format": meta.get("format", "PDF"),
        "pages": meta.get("pages", 24),
        "version": meta.get("version", "v1.0"),
        "visibility": meta.get("visibility", "Public / Verified Citation"),
        "summary": doc.summary or "",
        "file_url": meta.get("file_url")
    }

async def ensure_seed_documents(db: AsyncSession):
    try:
        count_res = await db.execute(select(func.count()).select_from(Document))
        total = count_res.scalar() or 0
        if total == 0:
            for seed in SEED_DOCUMENTS:
                doc = Document(
                    id=uuid.uuid4(),
                    title=seed["title"],
                    department=seed["department"],
                    category=seed["category"],
                    summary=seed["summary"],
                    status="Verified",
                    metadata_json=seed["metadata_json"],
                    embedding=generate_embedding(seed["title"] + " " + seed["summary"])
                )
                db.add(doc)
            await db.commit()
    except Exception as e:
        print(f"Warning: Could not check/seed documents table: {e}")

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        content = await file.read()
        storage_path, storage_type = storage_service.save_file(content, file.filename)
        metadata = ocr_service.process_document(content, file.filename)
        return {
            "success": True,
            "filename": file.filename,
            "file_url": storage_path,
            "storage_type": storage_type,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

@router.post("/commit")
async def commit_document(record: CommitRecordRequest, db: AsyncSession = Depends(get_db)):
    try:
        new_id = uuid.uuid4()
        ref_id = f"REG-2024-{str(new_id)[:6].upper()}"
        year_val = int(record.year) if record.year.isdigit() else 2024
        
        doc_metadata = {
            "ref_id": ref_id,
            "authority": record.authority,
            "theme": record.theme,
            "state_region": "All India",
            "administrative_level": record.administrative_level,
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": year_val,
            "published": datetime.now(timezone.utc).strftime("%d %b %Y"),
            "updated": "Just now",
            "format": "PDF",
            "pages": 12,
            "version": "v1.0",
            "visibility": "Public / Verified Citation",
            "file_name": record.file_name,
            "file_url": record.file_url
        }

        embedding_vector = generate_embedding(f"{record.title} {record.authority} {record.theme}")

        db_doc = Document(
            id=new_id,
            title=record.title,
            department=record.authority,
            category="Policy",
            status="Verified",
            summary=f"Uploaded record '{record.title}' issued by {record.authority}. Committed to National Registry.",
            metadata_json=doc_metadata,
            embedding=embedding_vector
        )

        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)

        return {
            "success": True,
            "message": "Record permanently committed to the National Registry (Neon DB)",
            "document": format_document_dict(db_doc)
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

@router.get("/documents")
async def get_documents(
    query: Optional[str] = None,
    state: Optional[str] = None,
    theme: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    try:
        await ensure_seed_documents(db)
        stmt = select(Document).order_by(Document.created_at.desc())
        result = await db.execute(stmt)
        docs = result.scalars().all()
        formatted = [format_document_dict(d) for d in docs]

        if state and state != "All India":
            formatted = [d for d in formatted if d.get("state_region") == state or d.get("state_region") == "All India"]
        if theme and theme != "All":
            formatted = [d for d in formatted if d.get("theme") == theme]
        if year_from:
            formatted = [d for d in formatted if d.get("year", 0) >= year_from]
        if year_to:
            formatted = [d for d in formatted if d.get("year", 0) <= year_to]
        if query:
            q = query.lower()
            formatted = [d for d in formatted if q in d.get("title", "").lower() or q in d.get("summary", "").lower()]
            
        return formatted
    except Exception as e:
        print(f"Warning: Database query failed, returning empty list: {e}")
        return []

@router.get("/documents/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    try:
        try:
            target_uuid = uuid.UUID(doc_id)
            stmt = select(Document).where(Document.id == target_uuid)
            res = await db.execute(stmt)
            doc = res.scalar_one_or_none()
            if doc:
                return format_document_dict(doc)
        except ValueError:
            pass

        stmt = select(Document)
        res = await db.execute(stmt)
        for doc in res.scalars().all():
            meta = doc.metadata_json or {}
            if meta.get("ref_id") == doc_id or str(doc.id) == doc_id:
                return format_document_dict(doc)

        raise HTTPException(status_code=404, detail="Document record not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database fetch failed: {str(e)}")
