"""
Land Governance Platform SDK - Knowledge Repository Models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class DocumentItem(BaseModel):
    id: str
    ref_id: str = Field(default="DOC-REF")
    title: str
    author: Optional[str] = Field(default="Department of Land Resources (DoLR)")
    year: int = Field(default=2024)
    state: str = "National"
    category: str = "Policy Guideline"
    summary: str = ""
    tags: List[str] = Field(default_factory=list)
    source: str = "live"
    is_offline: bool = False

class DocumentList(BaseModel):
    documents: List[DocumentItem]
    count: int
    source: str = "live"

    def to_dataframe(self) -> Any:
        """Converts document list into a Pandas DataFrame with metadata source tags."""
        try:
            import pandas as pd
            records = [d.model_dump() for d in self.documents]
            df = pd.DataFrame(records)
            df.attrs["source"] = self.source
            return df
        except ImportError:
            raise ImportError("Pandas is required for .to_dataframe(). Install via 'pip install land-governance-sdk[pandas]'")
