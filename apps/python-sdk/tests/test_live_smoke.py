"""
Land Governance Platform SDK - Live Backend Smoke Tests
Verifies real HTTP communication and schema alignment against live backend.
Automatically skipped if backend is down or unreachable.
"""

import pytest
import httpx
from land_governance_sdk import create_client

BACKEND_BASE_URL = "http://127.0.0.1:8000/api/v1"

def _is_backend_online() -> bool:
    """Probes backend health endpoint to determine if live smoke tests can execute."""
    try:
        resp = httpx.get(f"{BACKEND_BASE_URL}/healthz", timeout=1.5)
        return resp.status_code == 200
    except Exception:
        return False

@pytest.mark.skipif(not _is_backend_online(), reason="Backend is not running at http://127.0.0.1:8000/api/v1")
def test_live_backend_smoke_10_core_pitch_routes():
    """Executes the 10 core pitch routes against the live backend and asserts source='live'."""
    client = create_client(base_url=BACKEND_BASE_URL, fallback_to_offline=False)

    # 1. Fetch real challenge ID for leaderboard test
    challenges = client.innovation.list_challenges()
    assert len(challenges) > 0, "No challenges returned from live backend"
    real_challenge_id = challenges[0]["id"]

    calls = {
        "dashboard": lambda: client.analytics.get_dashboard("land_use", "Maharashtra"),
        "nlgi": lambda: client.analytics.get_nlgi("Maharashtra"),
        "geojson": lambda: client.geodata.get_geojson("lulc", 2020),
        "temporal": lambda: client.geodata.get_temporal_stats(2020),
        "baselines": lambda: client.simulate.get_baselines(),
        "trends": lambda: client.assistant.get_trends(),
        "summarize": lambda: client.assistant.summarize("Test", "Land records digitisation text.", "DoLR"),
        "showcase": lambda: client.innovation.get_showcase(0, 5),
        "stats": lambda: client.innovation.get_stats(),
        "leaderboard": lambda: client.innovation.get_leaderboard(real_challenge_id, 5),
    }

    results = {}
    for name, fn in calls.items():
        try:
            r = fn()
            src = getattr(r, "source", None)
            is_off = getattr(r, "is_offline", None)
            results[name] = {"result": r, "source": src, "is_offline": is_off}
            assert src == "live", f"Expected source='live' for {name}, got {src!r}"
            assert is_off is False, f"Expected is_offline=False for {name}, got {is_off!r}"
        except Exception as e:
            pytest.fail(f"Live call '{name}' failed with {type(e).__name__}: {e}")

    # Specific schema checks
    # Dashboard
    dash = results["dashboard"]["result"]
    assert "trends" in dash or "kpis" in dash
    assert dash.get("state") == "Maharashtra"

    # NLGI
    nlgi = results["nlgi"]["result"]
    assert "leaderboard" in nlgi or "rankings" in nlgi

    # GeoJSON
    geojson = results["geojson"]["result"]
    assert geojson.get("type") == "FeatureCollection"
    assert "features" in geojson

    # Temporal
    temporal = results["temporal"]["result"]
    assert "cadastral_digitization_pct" in temporal or "digitized_parcels_cr" in temporal

    # Baselines
    baselines = results["baselines"]["result"]
    assert "Maharashtra" in baselines or "states" in baselines

    # Trends
    trends = results["trends"]["result"]
    assert isinstance(trends, list)
    assert len(trends) > 0

    # Summarize
    summarize = results["summarize"]["result"]
    assert "executive_summary" in summarize or "summary" in summarize

    # Showcase
    showcase = results["showcase"]["result"]
    assert isinstance(showcase, list)

    # Stats
    stats = results["stats"]["result"]
    assert "total_challenges" in stats or "active_challenges" in stats

    # Leaderboard
    leaderboard = results["leaderboard"]["result"]
    assert isinstance(leaderboard, list)
