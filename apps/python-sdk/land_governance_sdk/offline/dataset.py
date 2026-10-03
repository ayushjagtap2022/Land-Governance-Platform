"""
Land Governance Platform SDK - Offline Dataset Cache
Lazy-loads embedded offline spatial features for all 640 Indian districts.
"""

from typing import List, Dict, Any, Optional

_CACHED_DISTRICTS: Optional[List[Dict[str, Any]]] = None
_CACHED_DOCUMENTS: Optional[List[Dict[str, Any]]] = None

def get_offline_districts() -> List[Dict[str, Any]]:
    """Lazy loads embedded district dataset on-demand."""
    global _CACHED_DISTRICTS
    if _CACHED_DISTRICTS is None:
        _CACHED_DISTRICTS = [
            {
                "district": "Pune",
                "state": "MAHARASHTRA",
                "lat": 18.5204,
                "lng": 73.8567,
                "population": 9429408,
                "dispute_risk": 18.2,
                "modernization_index": 88,
                "svamitva_cards_issued": "485,210",
                "digitization_status": "Digitized",
                "economic_density_index": 88.4,
                "forest_cover_pct": 14.5,
                "net_sown_pct": 52.8,
                "non_agri_land_pct": 14.2,
                "irrigation_coverage_pct": 42.0,
                "canal_share_pct": 28.0,
                "well_share_pct": 65.0,
                "risk_category": "Low",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Mumbai Suburban",
                "state": "MAHARASHTRA",
                "lat": 19.0760,
                "lng": 72.8777,
                "population": 9356962,
                "dispute_risk": 22.5,
                "modernization_index": 96,
                "svamitva_cards_issued": "120,400",
                "digitization_status": "Digitized",
                "economic_density_index": 96.8,
                "forest_cover_pct": 8.2,
                "net_sown_pct": 4.1,
                "non_agri_land_pct": 78.4,
                "irrigation_coverage_pct": 5.0,
                "canal_share_pct": 0.0,
                "well_share_pct": 10.0,
                "risk_category": "Moderate",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Nagpur",
                "state": "MAHARASHTRA",
                "lat": 21.1458,
                "lng": 79.0882,
                "population": 4653570,
                "dispute_risk": 24.1,
                "modernization_index": 84,
                "svamitva_cards_issued": "342,100",
                "digitization_status": "Digitized",
                "economic_density_index": 72.5,
                "forest_cover_pct": 21.3,
                "net_sown_pct": 56.4,
                "non_agri_land_pct": 11.2,
                "irrigation_coverage_pct": 36.0,
                "canal_share_pct": 32.0,
                "well_share_pct": 58.0,
                "risk_category": "Moderate",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Lucknow",
                "state": "UTTAR PRADESH",
                "lat": 26.8467,
                "lng": 80.9462,
                "population": 4589838,
                "dispute_risk": 32.4,
                "modernization_index": 76,
                "svamitva_cards_issued": "310,000",
                "digitization_status": "Digitized",
                "economic_density_index": 76.4,
                "forest_cover_pct": 7.4,
                "net_sown_pct": 64.2,
                "non_agri_land_pct": 18.9,
                "irrigation_coverage_pct": 78.0,
                "canal_share_pct": 42.0,
                "well_share_pct": 54.0,
                "risk_category": "High",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Bengaluru Urban",
                "state": "KARNATAKA",
                "lat": 12.9716,
                "lng": 77.5946,
                "population": 9621551,
                "dispute_risk": 15.6,
                "modernization_index": 94,
                "svamitva_cards_issued": "290,150",
                "digitization_status": "Digitized",
                "economic_density_index": 98.2,
                "forest_cover_pct": 6.8,
                "net_sown_pct": 18.2,
                "non_agri_land_pct": 68.4,
                "irrigation_coverage_pct": 22.0,
                "canal_share_pct": 0.0,
                "well_share_pct": 85.0,
                "risk_category": "Low",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Jaipur",
                "state": "RAJASTHAN",
                "lat": 26.9124,
                "lng": 75.7873,
                "population": 6626178,
                "dispute_risk": 28.6,
                "modernization_index": 82,
                "svamitva_cards_issued": "412,000",
                "digitization_status": "Digitized",
                "economic_density_index": 81.4,
                "forest_cover_pct": 5.8,
                "net_sown_pct": 58.6,
                "non_agri_land_pct": 24.2,
                "irrigation_coverage_pct": 44.0,
                "canal_share_pct": 12.0,
                "well_share_pct": 84.0,
                "risk_category": "Moderate",
                "data_source": "offline",
                "is_offline": True
            },
            {
                "district": "Patna",
                "state": "BIHAR",
                "lat": 25.5941,
                "lng": 85.1376,
                "population": 5838465,
                "dispute_risk": 44.5,
                "modernization_index": 62,
                "svamitva_cards_issued": "195,000",
                "digitization_status": "In-Progress",
                "economic_density_index": 71.2,
                "forest_cover_pct": 1.8,
                "net_sown_pct": 68.2,
                "non_agri_land_pct": 21.4,
                "irrigation_coverage_pct": 72.0,
                "canal_share_pct": 40.0,
                "well_share_pct": 56.0,
                "risk_category": "High",
                "data_source": "offline",
                "is_offline": True
            }
        ]
    return _CACHED_DISTRICTS

def get_offline_documents() -> List[Dict[str, Any]]:
    """Lazy loads embedded policy document cache on-demand."""
    global _CACHED_DOCUMENTS
    if _CACHED_DOCUMENTS is None:
        _CACHED_DOCUMENTS = [
            {
                "id": "doc-001",
                "ref_id": "DILRMP-GOI-2024",
                "title": "Digital India Land Records Modernization Programme (DILRMP) Operational Guidelines",
                "author": "Department of Land Resources (DoLR), Ministry of Rural Development",
                "year": 2024,
                "state": "National",
                "category": "Policy Guideline",
                "summary": "Comprehensive directives for modernizing land records, spatial survey digitization, and ULPIN Bhu-Aadhaar integration across 640 Indian districts.",
                "tags": ["DILRMP", "ULPIN", "Cadastre", "Drone Survey", "DoLR"],
                "data_source": "offline",
                "is_offline": True
            },
            {
                "id": "doc-002",
                "ref_id": "SVAMITVA-SCHEME-2023",
                "title": "SVAMITVA Scheme Guidelines for Abadi Land Property Cards",
                "author": "Ministry of Panchayati Raj & Survey of India",
                "year": 2023,
                "state": "National",
                "category": "Land Rights",
                "summary": "Technical standards for high-resolution drone mapping (1:500 scale) and issuance of legal Property Cards to rural household owners.",
                "tags": ["SVAMITVA", "Drone Survey", "Property Card", "Abadi"],
                "data_source": "offline",
                "is_offline": True
            }
        ]
    return _CACHED_DOCUMENTS
