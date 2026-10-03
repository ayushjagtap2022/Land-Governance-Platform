import os
import uuid
import numpy as np
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from app.api.dependencies import get_db
from app.models.document import Document, DocumentChunk
from app.services.storage_service import storage_service
from app.services.ocr_service import ocr_service, ExtractedMetadata
from app.core.config import settings
from app.core.permissions import Permission
from app.api.dependencies import require_permission
from app.services.document_ingestion_service import (
    DocumentIngestionError,
    chunk_pages,
    extract_pages,
    sha256,
)

router = APIRouter()
logger = logging.getLogger(__name__)

class CommitRecordRequest(BaseModel):
    title: str
    authority: str
    year: str
    theme: str
    administrative_level: str
    file_name: str
    file_url: str


class ReviewDocumentRequest(BaseModel):
    decision: str
    review_note: Optional[str] = None

async def generate_embedding(text: str) -> Optional[List[float]]:
    """Generate a real Gemini embedding, or leave the vector unset.

    We intentionally do not fabricate vectors.  Documents can still be listed and
    exact-searched without an embedding provider; semantic search is simply unavailable
    until ``GEMINI_API_KEY`` is configured and existing records are re-indexed.
    """
    if not settings.GEMINI_API_KEY or not text.strip():
        return None
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        result = client.models.embed_content(
            model=settings.GEMINI_EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=1024),
        )
        embeddings = result.embeddings or []
        values = list(embeddings[0].values) if embeddings else []
        if len(values) != 1024:
            logger.warning("Embedding provider returned %s dimensions; expected 1024.", len(values))
            return None
        return values
    except Exception:
        logger.exception("Could not generate document embedding; storing document without a vector.")
        return None

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
        "summary": "Technical and operational protocol for drone survey, Gram Sabha validation, and issuance of legal property cards across rural inhabited (Abadi) areas.",
        "metadata_json": {
            "ref_id": "SVAMITVA-2024-014",
            "theme": "SVAMITVA Scheme",
            "state_region": "All India",
            "administrative_level": "National",
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
        "title": "Chandigarh UT Urban Land Records & Tenancy Harmonization Framework",
        "department": "Department of Revenue, Chandigarh Administration",
        "category": "Policy",
        "summary": "Comprehensive statutory framework for digital land records, urban title verification, cadastral modernization, and tenancy protections in Chandigarh Union Territory.",
        "metadata_json": {
            "ref_id": "CHD-REV-2024-001",
            "theme": "Cadastral Mapping",
            "state_region": "Chandigarh",
            "administrative_level": "District",
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": 2024,
            "published": "15 Feb 2024",
            "updated": "10 Aug 2024",
            "format": "PDF",
            "pages": 38,
            "version": "v1.1",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Punjab Land Revenue (Digitization of Jamabandi & Cadastral Resurvey) Guidelines",
        "department": "Department of Revenue & Rehabilitation, Punjab",
        "category": "Legislation",
        "summary": "Statutory rules for digitizing Jamabandi (RoR) records, drone cadastral survey integration, and sub-registrar deed registration linkage.",
        "metadata_json": {
            "ref_id": "PB-REV-2024-005",
            "theme": "Cadastral Mapping",
            "state_region": "Punjab",
            "administrative_level": "State",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2024,
            "published": "28 Mar 2024",
            "updated": "04 Jul 2024",
            "format": "PDF",
            "pages": 56,
            "version": "v2.0",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Haryana Land Record Information System (Web-HALRIS) & Drone Mapping Protocol",
        "department": "Revenue & Disaster Management Department, Haryana",
        "category": "Standard",
        "summary": "Standard operating procedures for drone survey in rural Lal Dora areas and issuance of title property cards via Web-HALRIS.",
        "metadata_json": {
            "ref_id": "HR-HALRIS-2024-003",
            "theme": "SVAMITVA Scheme",
            "state_region": "Haryana",
            "administrative_level": "State",
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": 2024,
            "published": "16 Apr 2024",
            "updated": "12 Jul 2024",
            "format": "PDF",
            "pages": 42,
            "version": "v1.4",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Right to Fair Compensation & Transparency in Land Acquisition (RFCTLARR 2013)",
        "department": "Ministry of Rural Development",
        "category": "Legislation",
        "summary": "National legal statutory framework regulating land acquisition, social impact assessment, fair compensation, and mandatory rehabilitation & resettlement across India.",
        "metadata_json": {
            "ref_id": "RFCTLARR-2013-001",
            "theme": "Land Dispute Resolution",
            "state_region": "All India",
            "administrative_level": "National",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2023,
            "published": "14 Oct 2023",
            "updated": "05 Jan 2024",
            "format": "PDF",
            "pages": 78,
            "version": "v2.4",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Survey of India National Drone Cadastral Mapping SOP (Sub-5cm GSD)",
        "department": "Survey of India, Department of Science & Technology",
        "category": "Standard",
        "summary": "Technical standard operating procedure for CORS network drone surveying, GCP validation, orthomosaic generation, and feature extraction for cadastral parcel demarcation.",
        "metadata_json": {
            "ref_id": "SOI-2024-008",
            "theme": "Cadastral Mapping",
            "state_region": "All India",
            "administrative_level": "National",
            "document_type": "Policy Paper",
            "record_type": "Policy Drafts",
            "year": 2024,
            "published": "02 May 2024",
            "updated": "28 Aug 2024",
            "format": "PDF",
            "pages": 62,
            "version": "v1.8",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Bhuvan ISRO Geo-Portal Cadastral & Land Use Integration Guidelines",
        "department": "National Remote Sensing Centre (NRSC / ISRO)",
        "category": "Standard",
        "summary": "Interoperability specifications for publishing state cadastral vectors onto the ISRO Bhuvan geo-spatial platform and Open Geospatial Consortium (OGC) WMS/WFS services.",
        "metadata_json": {
            "ref_id": "ISRO-BHUVAN-2024",
            "theme": "Cadastral Mapping",
            "state_region": "All India",
            "administrative_level": "National",
            "document_type": "Policy Paper",
            "record_type": "Datasets",
            "year": 2024,
            "published": "18 Jan 2024",
            "updated": "15 May 2024",
            "format": "PDF",
            "pages": 36,
            "version": "v1.2",
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
    },
    {
        "title": "Karnataka Bhoomi & Dishaank Mobile Cadastral App Architecture",
        "department": "Revenue Department, Government of Karnataka",
        "category": "Research Study",
        "summary": "Technical architecture and field verification methodologies behind Bhoomi digital RoR and Dishaank mobile app for geo-referenced RTC lookup.",
        "metadata_json": {
            "ref_id": "KA-BHOOMI-2024-011",
            "theme": "Cadastral Mapping",
            "state_region": "Karnataka",
            "administrative_level": "State",
            "document_type": "Research Study",
            "record_type": "Research Studies",
            "year": 2024,
            "published": "12 Mar 2024",
            "updated": "24 Jun 2024",
            "format": "PDF",
            "pages": 40,
            "version": "v1.1",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Uttar Pradesh Bhu-Lekh RoR & Real-Time Khatauni Mutation Protocol",
        "department": "Board of Revenue, Uttar Pradesh",
        "category": "Legislation",
        "summary": "Government order mandating online automatic mutation of uncontested succession cases within 15 days on the UP Bhu-Lekh portal.",
        "metadata_json": {
            "ref_id": "UP-BHULEKH-2024-006",
            "theme": "Land Dispute Resolution",
            "state_region": "Uttar Pradesh",
            "administrative_level": "State",
            "document_type": "Legal Act",
            "record_type": "Acts / Gazettes",
            "year": 2024,
            "published": "08 May 2024",
            "updated": "18 Aug 2024",
            "format": "PDF",
            "pages": 34,
            "version": "v1.3",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Harda District Pilot: 100% Saturation of Drone Resurvey & SVAMITVA Property Cards",
        "department": "Ministry of Panchayati Raj & Govt. of Madhya Pradesh",
        "category": "Case Studies",
        "summary": "Comprehensive field case study evaluating drone orthomosaic generation, Gram Sabha verification, dispute mediation, and 100% property card saturation across 402 revenue villages in Harda.",
        "metadata_json": {
            "ref_id": "CASE-2024-SVAMITVA-HARDA",
            "theme": "SVAMITVA Scheme",
            "state_region": "Madhya Pradesh",
            "administrative_level": "District",
            "document_type": "Case Study Report",
            "record_type": "Field Case Studies",
            "year": 2024,
            "published": "18 Mar 2024",
            "updated": "18 Mar 2024",
            "format": "PDF",
            "pages": 28,
            "version": "v1.0",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Pune Collectorate: Automated Mutation & e-Chawdi Modern Record Room Integration",
        "department": "Department of Revenue, Govt. of Maharashtra",
        "category": "Case Studies",
        "summary": "Implementation analysis of linking sub-registrar deed registration directly to computerized 7/12 mutation notices, reducing pendency from 180 days to 21 days across Haveli and Pune city taluks.",
        "metadata_json": {
            "ref_id": "CASE-2024-ECHAWDI-PUNE",
            "theme": "Land Dispute Resolution",
            "state_region": "Maharashtra",
            "administrative_level": "District",
            "document_type": "Case Study Report",
            "record_type": "Field Case Studies",
            "year": 2024,
            "published": "10 May 2024",
            "updated": "12 Jun 2024",
            "format": "PDF",
            "pages": 42,
            "version": "v1.2",
            "visibility": "Public / Verified Citation"
        }
    },
    {
        "title": "Bengaluru Peri-Urban Tenancy & Encroachment Resolution via Web-GIS Cadastre",
        "department": "Karnataka Revenue Department & Survey Settlement Directorate",
        "category": "Case Studies",
        "summary": "Technical field case study on resolving boundary disputes in high-value peri-urban transition corridors by reconciling legacy British-era tipan survey sketches with modern satellite ortho-imagery.",
        "metadata_json": {
            "ref_id": "CASE-2024-CADASTRE-BLR",
            "theme": "Tenancy Rights",
            "state_region": "Karnataka",
            "administrative_level": "District",
            "document_type": "Case Study Report",
            "record_type": "Field Case Studies",
            "year": 2023,
            "published": "22 Nov 2023",
            "updated": "15 Jan 2024",
            "format": "PDF",
            "pages": 36,
            "version": "v1.0",
            "visibility": "Public / Verified Citation"
        }
    }
]

def format_document_dict(doc: Document, similarity: Optional[float] = None) -> Dict[str, Any]:
    meta = doc.metadata_json or {}
    res = {
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
    if similarity is not None:
        res["similarity_score"] = round(similarity * 100, 1)
    return res

async def ensure_seed_documents(db: AsyncSession):
    try:
        stmt = select(Document)
        res = await db.execute(stmt)
        existing_docs = res.scalars().all()
        existing_refs = set()
        for doc in existing_docs:
            meta = doc.metadata_json or {}
            ref = meta.get("ref_id")
            if ref:
                existing_refs.add(ref)
            existing_refs.add(doc.title.strip().lower())

        added = False
        for seed in SEED_DOCUMENTS:
            ref = seed["metadata_json"].get("ref_id")
            title_key = seed["title"].strip().lower()
            if (ref and ref not in existing_refs) and (title_key not in existing_refs):
                doc = Document(
                    id=uuid.uuid4(),
                    title=seed["title"],
                    department=seed["department"],
                    category=seed["category"],
                    summary=seed["summary"],
                    status="Verified",
                    metadata_json=seed["metadata_json"],
                    embedding=await generate_embedding(seed["title"] + " " + seed["summary"] + " " + seed["metadata_json"].get("state_region", ""))
                )
                db.add(doc)
                existing_refs.add(ref)
                existing_refs.add(title_key)
                added = True
        if added:
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


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    authority: str = Form(...),
    source_url: str = Form(...),
    source_license: str = Form(...),
    category: str = Form("Policy"),
    theme: str = Form("Unclassified"),
    state_region: str = Form("All India"),
    administrative_level: str = Form("National"),
    publication_year: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_permission(Permission.UPLOAD_DOCS)),
):
    """Stage an evidence document with mandatory provenance for administrator review."""
    if not all(value.strip() for value in (title, authority, source_url, source_license)):
        raise HTTPException(status_code=422, detail="Title, authority, source URL, and source licence are required.")
    if not source_url.lower().startswith(("https://", "http://")):
        raise HTTPException(status_code=422, detail="Source URL must use http:// or https://.")

    content = await file.read()
    try:
        pages = extract_pages(file.filename or "upload", content)
        chunks = chunk_pages(pages)
    except DocumentIngestionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    file_hash = sha256(content)
    existing_result = await db.execute(select(Document))
    for existing in existing_result.scalars().all():
        if (existing.metadata_json or {}).get("content_sha256") == file_hash:
            raise HTTPException(status_code=409, detail="This exact file has already been staged in the repository.")

    storage_path, storage_type = storage_service.save_file(content, f"{file_hash[:12]}_{file.filename}")
    now = datetime.now(timezone.utc)
    metadata = {
        "ref_id": f"STG-{str(uuid.uuid4())[:8].upper()}",
        "source_url": source_url.strip(),
        "source_license": source_license.strip(),
        "source_authority": authority.strip(),
        "content_sha256": file_hash,
        "original_filename": file.filename,
        "file_url": storage_path,
        "storage_type": storage_type,
        "format": file.filename.rsplit(".", 1)[-1].upper() if "." in file.filename else "UNKNOWN",
        "pages": len(pages),
        "publication_year": publication_year,
        "state_region": state_region,
        "administrative_level": administrative_level,
        "theme": theme,
        "review_status": "pending",
        "submitted_by": str(current_user.id),
        "submitted_at": now.isoformat(),
        "source_required": True,
    }
    document = Document(
        title=title.strip(),
        department=authority.strip(),
        category=category.strip(),
        status="Pending review",
        summary=chunks[0].content[:500],
        metadata_json=metadata,
    )
    db.add(document)
    await db.flush()
    for chunk in chunks:
        db.add(DocumentChunk(
            document_id=document.id,
            page_number=chunk.page_number,
            chunk_index=chunk.chunk_index,
            content=chunk.content,
            content_sha256=chunk.content_sha256,
        ))
    await db.commit()
    await db.refresh(document)
    return {
        "success": True,
        "document": format_document_dict(document),
        "review_status": "pending",
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "message": "Document staged with provenance and awaits administrator review.",
    }


@router.post("/documents/{doc_id}/review")
async def review_document(
    doc_id: str,
    payload: ReviewDocumentRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_permission(Permission.MODERATE_CONTENT)),
):
    """Approve or reject a staged document; only approved documents may be indexed."""
    decision = payload.decision.lower().strip()
    if decision not in {"approved", "rejected"}:
        raise HTTPException(status_code=422, detail="Decision must be 'approved' or 'rejected'.")
    try:
        document_id = uuid.UUID(doc_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Document ID must be a UUID.") from exc
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    metadata = dict(document.metadata_json or {})
    metadata.update({
        "review_status": decision,
        "reviewed_by": str(current_user.id),
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "review_note": payload.review_note,
    })
    document.metadata_json = metadata
    document.status = "Verified" if decision == "approved" else "Rejected"
    document.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(document)
    return {"success": True, "document": format_document_dict(document), "review_status": decision}

@router.post("/commit")
async def commit_document(record: CommitRecordRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Check for duplicates by title
        dup_stmt = select(Document).where(Document.title == record.title)
        dup_res = await db.execute(dup_stmt)
        existing_doc = dup_res.scalar_one_or_none()
        if existing_doc:
            return {
                "success": False,
                "duplicate": True,
                "message": f"Duplicate record detected: '{record.title}' is already registered in the National Registry.",
                "document": format_document_dict(existing_doc)
            }

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

        embedding_vector = await generate_embedding(f"{record.title} {record.authority} {record.theme}")

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
    search_mode: Optional[str] = "exact",
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    try:
        stmt = select(Document).order_by(Document.created_at.desc())
        result = await db.execute(stmt)
        docs = result.scalars().all()

        query_vec = await generate_embedding(query.strip()) if (query and search_mode == "semantic") else None

        scored_docs = []
        for d in docs:
            sim = None
            if query_vec is not None and d.embedding is not None:
                sim = float(np.dot(query_vec, d.embedding))
            scored_docs.append((d, sim))

        # Filter and format
        formatted = []
        seen_titles = set()
        for d, sim in scored_docs:
            doc_dict = format_document_dict(d, similarity=sim)
            normalized_title = (doc_dict.get("title") or "").strip().lower()
            if normalized_title and normalized_title in seen_titles:
                continue
            seen_titles.add(normalized_title)
            
            # Apply state filter
            if state and state != "All India":
                if doc_dict.get("state_region") != state and doc_dict.get("state_region") != "All India":
                    continue

            # Apply theme filter
            if theme and theme != "All" and theme != "All Themes":
                if doc_dict.get("theme") != theme:
                    continue

            # Apply year range filters
            if year_from and doc_dict.get("year", 0) < year_from:
                continue
            if year_to and doc_dict.get("year", 0) > year_to:
                continue

            # Apply query filtering
            if query and query.strip():
                q = query.strip().lower()
                text_blob = f"{doc_dict.get('title', '')} {doc_dict.get('summary', '')} {doc_dict.get('department', '')} {doc_dict.get('state_region', '')} {doc_dict.get('theme', '')} {doc_dict.get('administrative_level', '')} {doc_dict.get('ref_id', '')}".lower()
                if search_mode == "exact":
                    q_words = [w for w in q.split() if len(w) > 1]
                    if q not in text_blob and not (q_words and all(w in text_blob for w in q_words)):
                        continue
                elif search_mode == "semantic":
                    # In semantic mode, include if similarity is positive or text has match
                    if (sim is not None and sim < 0.05) and (q not in text_blob):
                        continue

            formatted.append(doc_dict)

        # Sort by similarity score if semantic mode
        if search_mode == "semantic" and query_vec is not None:
            formatted.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)

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

@router.get("/documents/{doc_id}/related")
async def get_related_documents(doc_id: str, limit: int = 3, db: AsyncSession = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Returns related documents based on vector cosine similarity (PS point 14).
    """
    try:
        target_doc = None
        try:
            target_uuid = uuid.UUID(doc_id)
            stmt = select(Document).where(Document.id == target_uuid)
            res = await db.execute(stmt)
            target_doc = res.scalar_one_or_none()
        except ValueError:
            pass

        if not target_doc:
            stmt = select(Document)
            res = await db.execute(stmt)
            for doc in res.scalars().all():
                meta = doc.metadata_json or {}
                if meta.get("ref_id") == doc_id or str(doc.id) == doc_id:
                    target_doc = doc
                    break

        if not target_doc or target_doc.embedding is None:
            return []

        # Find other documents and compute similarity
        stmt = select(Document).where(Document.id != target_doc.id)
        res = await db.execute(stmt)
        other_docs = res.scalars().all()

        scored = []
        target_vec = target_doc.embedding
        for d in other_docs:
            if d.embedding:
                sim = float(np.dot(target_vec, d.embedding))
                scored.append((d, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [format_document_dict(d, similarity=sim) for d, sim in scored[:limit]]
    except Exception as e:
        print(f"Warning: Failed to retrieve related documents: {e}")
        return []


@router.get("/recommendations")
async def get_recommended_documents(
    role: Optional[str] = "Researcher",
    limit: int = 4,
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    AI-Powered personalized document recommendations (PS point 8).
    Tailors discovery feed based on user role and policy priorities.
    """
    try:
        stmt = select(Document)
        res = await db.execute(stmt)
        all_docs = res.scalars().all()
        if not all_docs:
            return []

        formatted = []
        seen_rec_titles = set()
        for d in all_docs:
            d_dict = format_document_dict(d)
            norm_title = (d_dict.get("title") or "").strip().lower()
            if norm_title and norm_title in seen_rec_titles:
                continue
            seen_rec_titles.add(norm_title)
            formatted.append(d_dict)

        r = (role or "Researcher").lower()

        if "official" in r or "admin" in r:
            preferred_themes = ["Cadastral Mapping", "Land Dispute Resolution"]
            scored = sorted(
                formatted,
                key=lambda x: (
                    1 if x.get("theme") in preferred_themes else 0,
                    1 if x.get("category") in ["Legislation", "Standards & guidelines"] else 0,
                    x.get("year", 2020)
                ),
                reverse=True
            )
        elif "public" in r:
            scored = sorted(
                formatted,
                key=lambda x: (
                    1 if "SVAMITVA" in x.get("title", "") or "Compensation" in x.get("title", "") else 0,
                    x.get("year", 2020)
                ),
                reverse=True
            )
        else:
            scored = sorted(
                formatted,
                key=lambda x: (
                    1 if x.get("category") in ["Case Studies", "Research & evidence"] else 0,
                    x.get("year", 2020)
                ),
                reverse=True
            )

        return scored[:limit]
    except Exception as e:
        print(f"Warning: Failed to fetch recommendations: {e}")
        return []

