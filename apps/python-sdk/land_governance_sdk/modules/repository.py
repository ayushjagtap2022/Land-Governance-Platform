"""
Land Governance Platform SDK - Knowledge Repository Module
"""

from typing import Optional, List, Dict, Any
from ..http_client import HttpClient
from ..errors import LandGovernanceNetworkError
from ..models.repository import DocumentItem, DocumentList
from ..offline.dataset import get_offline_documents

class RepositoryModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def list(
        self,
        query: Optional[str] = None,
        state: Optional[str] = None,
        category: Optional[str] = None,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
        limit: int = 50,
    ) -> DocumentList:
        """Retrieves or searches Central Knowledge Repository policy documents."""
        params = {
            "query": query,
            "state": state,
            "category": category,
            "year_from": year_from,
            "year_to": year_to,
            "limit": limit,
        }

        try:
            raw = self.http.request(method="GET", endpoint="/repository/documents", params=params)
            docs_data = raw if isinstance(raw, list) else raw.get("documents", [])
            docs = [DocumentItem(**d) for d in docs_data]
            return DocumentList(documents=docs, count=len(docs), source="live")
        except LandGovernanceNetworkError as err:
            if not (self.http.config.fallback_to_offline or self.http.is_offline()):
                raise err
            raw_docs = get_offline_documents()
            if query:
                q_clean = query.lower()
                raw_docs = [
                    d for d in raw_docs
                    if q_clean in d["title"].lower() or q_clean in d["summary"].lower() or any(q_clean in t.lower() for t in d["tags"])
                ]
            docs = [DocumentItem(**d) for d in raw_docs[:limit]]
            return DocumentList(documents=docs, count=len(docs), source="offline")

    def search(self, query: str, state: Optional[str] = None) -> DocumentList:
        """Convenience shortcut for policy semantic search."""
        return self.list(query=query, state=state)

    def get(self, document_id: str) -> DocumentItem:
        """Retrieves single policy document metadata by ID."""
        try:
            raw = self.http.request(method="GET", endpoint=f"/repository/documents/{document_id}")
            return DocumentItem(**raw)
        except LandGovernanceNetworkError:
            raw_docs = get_offline_documents()
            for d in raw_docs:
                if d["id"] == document_id or d["ref_id"] == document_id:
                    return DocumentItem(**d)
            raise LandGovernanceNetworkError(f"Document '{document_id}' not found in offline dataset.")
