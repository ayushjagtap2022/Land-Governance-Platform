import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
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

class DocumentRecord(BaseModel):
    id: str
    ref_id: str
    title: str
    department: str
    category: str
    theme: str
    state_region: str
    administrative_level: str
    document_type: str
    record_type: str
    year: int
    published: str
    updated: str
    status: str
    format: str
    pages: int
    version: str
    visibility: str
    summary: str
    file_url: Optional[str] = None

# Initial catalog pre-seeded with authoritative government policy records
CATALOG: List[Dict[str, Any]] = [
    {
        "id": "DOC-26019-001",
        "ref_id": "DILRMP-2024-001",
        "title": "National Land Records Modernisation Programme (DILRMP) Core Framework",
        "department": "Department of Land Resources",
        "category": "Policy",
        "theme": "Cadastral Mapping",
        "state_region": "All India",
        "administrative_level": "National",
        "document_type": "Policy Paper",
        "record_type": "Policy Drafts",
        "year": 2024,
        "published": "12 Jan 2024",
        "updated": "18 Jun 2024",
        "status": "Verified",
        "format": "PDF",
        "pages": 48,
        "version": "v2.1",
        "visibility": "Public / Verified Citation",
        "summary": "Standard operating procedure for linking cadastral maps with digital Records of Rights (RoR). Mandates sub-5cm spatial precision for drone surveys."
    },
    {
        "id": "DOC-26019-002",
        "ref_id": "SVAMITVA-2024-014",
        "title": "SVAMITVA Scheme Guidelines: Drone Survey & Property Validation",
        "department": "Ministry of Panchayati Raj",
        "category": "Standard",
        "theme": "SVAMITVA Scheme",
        "state_region": "Maharashtra",
        "administrative_level": "State",
        "document_type": "Policy Paper",
        "record_type": "Policy Drafts",
        "year": 2024,
        "published": "04 Mar 2024",
        "updated": "22 May 2024",
        "status": "Verified",
        "format": "PDF",
        "pages": 64,
        "version": "v1.3",
        "visibility": "Public / Verified Citation",
        "summary": "Technical and operational protocol for drone survey, Gram Sabha validation, and issuance of legal property cards."
    },
    {
        "id": "DOC-26019-003",
        "ref_id": "LEASING-2023-009",
        "title": "Model Agricultural Land Leasing Act & State Adoption Guidelines",
        "department": "NITI Aayog",
        "category": "Legislation",
        "theme": "Tenancy Rights",
        "state_region": "Madhya Pradesh",
        "administrative_level": "State",
        "document_type": "Legal Act",
        "record_type": "Acts / Gazettes",
        "year": 2023,
        "published": "18 Nov 2023",
        "updated": "14 Feb 2024",
        "status": "Verified",
        "format": "PDF",
        "pages": 32,
        "version": "v1.0",
        "visibility": "Public / Verified Citation",
        "summary": "Model legal framework enabling institutional credit for tenant farmers while protecting land ownership."
    },
    {
        "id": "DOC-26019-004",
        "ref_id": "FRA-2023-018",
        "title": "Forest Rights Act (FRA) Title Verification Guidelines",
        "department": "Ministry of Tribal Affairs",
        "category": "Legislation",
        "theme": "Climate Resilience",
        "state_region": "All India",
        "administrative_level": "National",
        "document_type": "Legal Act",
        "record_type": "Acts / Gazettes",
        "year": 2023,
        "published": "09 Sep 2023",
        "updated": "11 Jan 2024",
        "status": "Verified",
        "format": "PDF",
        "pages": 52,
        "version": "v1.2",
        "visibility": "Public / Verified Citation",
        "summary": "Standard verification protocols for Individual and Community Forest Rights titles with spatial boundary demarcation."
    },
    {
        "id": "DOC-26019-005",
        "ref_id": "MLRC-2024-007",
        "title": "Maharashtra Land Revenue Code Digital Mutation Rules",
        "department": "Revenue & Forest Department, Maharashtra",
        "category": "Legislation",
        "theme": "Land Dispute Resolution",
        "state_region": "Maharashtra",
        "administrative_level": "State",
        "document_type": "Legal Act",
        "record_type": "Acts / Gazettes",
        "year": 2024,
        "published": "20 Feb 2024",
        "updated": "30 May 2024",
        "status": "Verified",
        "format": "PDF",
        "pages": 44,
        "version": "v2.0",
        "visibility": "Public / Verified Citation",
        "summary": "Notified procedures for fast-track dispute disposal and automated online mutation under the e-Mutation portal."
    }
]

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Staged document ingestion endpoint:
    1. Saves file to AWS S3 (or local storage fallback).
    2. Runs Multimodal Gemini Vision OCR & NLP metadata extraction.
    3. Returns extracted metadata for human review.
    """
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
async def commit_document(record: CommitRecordRequest):
    """
    Commits reviewed document metadata to the permanent national registry catalog.
    """
    new_id = f"DOC-26019-{len(CATALOG) + 1:03d}"
    ref_id = f"REG-2024-{len(CATALOG) + 1:03d}"
    
    new_doc = {
        "id": new_id,
        "ref_id": ref_id,
        "title": record.title,
        "department": record.authority,
        "category": "Policy",
        "theme": record.theme,
        "state_region": "All India",
        "administrative_level": record.administrative_level,
        "document_type": "Policy Paper",
        "record_type": "Policy Drafts",
        "year": int(record.year) if record.year.isdigit() else 2024,
        "published": "Today",
        "updated": "Just now",
        "status": "Verified",
        "format": "PDF",
        "pages": 12,
        "version": "v1.0",
        "visibility": "Public / Verified Citation",
        "summary": f"Uploaded record '{record.title}' issued by {record.authority}. Committed to National Registry.",
        "file_url": record.file_url
    }
    
    CATALOG.insert(0, new_doc)
    return {"success": True, "message": "Record committed to the National Registry", "document": new_doc}

@router.get("/documents")
async def get_documents(
    query: Optional[str] = None,
    state: Optional[str] = None,
    theme: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Search and filter catalog records across state, theme, keyword, and year range.
    """
    results = CATALOG
    if state and state != "All India":
        results = [d for d in results if d.get("state_region") == state or d.get("state_region") == "All India"]
    if theme and theme != "All":
        results = [d for d in results if d.get("theme") == theme]
    if year_from:
        results = [d for d in results if d.get("year", 0) >= year_from]
    if year_to:
        results = [d for d in results if d.get("year", 0) <= year_to]
    if query:
        q = query.lower()
        results = [d for d in results if q in d.get("title", "").lower() or q in d.get("summary", "").lower()]
    return results

@router.get("/documents/{doc_id}")
async def get_document(doc_id: str):
    doc = next((d for d in CATALOG if d["id"] == doc_id or d["ref_id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document record not found")
    return doc
