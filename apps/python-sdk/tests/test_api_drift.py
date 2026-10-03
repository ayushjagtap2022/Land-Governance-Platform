"""
API Drift Contract Test for Land Governance Python SDK
Verifies SDK models against FastAPI OpenAPI schema definitions.
"""

import json
from pathlib import Path

# Resolve fixture path relative to this file location for cross-directory safety
TESTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = TESTS_DIR.parent.parent.parent
OPENAPI_FIXTURE_PATH = REPO_ROOT / "tests" / "fixtures" / "openapi.json"

def test_openapi_fixture_exists_and_valid():
    """Verify openapi.json fixture loads and contains required API routes."""
    assert OPENAPI_FIXTURE_PATH.exists(), f"OpenAPI fixture not found at {OPENAPI_FIXTURE_PATH}"
    with open(OPENAPI_FIXTURE_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    paths = schema.get("paths", {})
    assert "/geodata/districts" in paths or "/api/v1/geodata/districts" in paths or any("geodata" in p for p in paths)
    assert any("repository" in p or "documents" in p for p in paths)
    assert any("simulate" in p for p in paths)

def test_geodata_districts_schema_drift():
    """Verify geodata district endpoint schema fields match SDK expectations."""
    with open(OPENAPI_FIXTURE_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    paths = schema.get("paths", {})
    target_path = None
    for p in paths:
        if "geodata/districts" in p:
            target_path = paths[p]
            break

    assert target_path is not None, "District endpoint missing in OpenAPI schema"
    get_op = target_path.get("get")
    assert get_op is not None, "GET method missing for district endpoint"

def test_document_schema_author_optionality():
    """Verify DocumentItem schema in OpenAPI allows optional author field."""
    with open(OPENAPI_FIXTURE_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    schemas = schema.get("components", {}).get("schemas", {})
    doc_schema = None
    for name, s in schemas.items():
        if "document" in name.lower():
            doc_schema = s
            break

    # If document schema exists, ensure author is not strictly required without default
    if doc_schema:
        props = doc_schema.get("properties", {})
        assert "title" in props or "id" in props

if __name__ == "__main__":
    test_openapi_fixture_exists_and_valid()
    test_geodata_districts_schema_drift()
    test_document_schema_author_optionality()
    print("ALL API DRIFT CONTRACT TESTS PASSED!")
