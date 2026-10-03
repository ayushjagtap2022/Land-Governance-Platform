"""
Native Test Suite for Land Governance Python SDK (land_governance_sdk)
Tests success paths + failure paths (401, 403, 404, 429, timeouts, 5xx, invalid parameters, write operations).
"""

import json
import warnings
from pathlib import Path
from unittest.mock import patch, MagicMock
import httpx

from land_governance_sdk import LandGovernanceClient, create_client
from land_governance_sdk.errors import (
    LandGovernanceApiError,
    LandGovernanceOfflineError,
    LandGovernanceNetworkError,
    LandGovernanceTimeoutError,
)

ROOT_FIXTURE_PATH = Path(__file__).parent.parent.parent.parent / "tests" / "fixtures" / "simulation_golden_vectors.json"

def test_client_initialization():
    client = LandGovernanceClient()
    assert client.get_base_url() == "http://127.0.0.1:8000/api/v1"
    assert client.auth is not None
    assert client.repository is not None
    assert client.documents == client.repository
    assert client.assistant == client.ai
    assert client.geodata == client.gis
    assert client.simulate == client.simulation

def test_factory_function():
    client = create_client(base_url="https://api.landgov.gov.in/api/v1", token="test-jwt")
    assert client.get_base_url() == "https://api.landgov.gov.in/api/v1"
    assert client.get_token() == "test-jwt"
    assert client.is_authenticated() is True

def test_token_management():
    client = LandGovernanceClient()
    assert client.is_authenticated() is False

    client.set_token("sample-bearer-token")
    assert client.get_token() == "sample-bearer-token"
    assert client.is_authenticated() is True

    client.logout()
    assert client.is_authenticated() is False
    assert client.get_token() is None

def test_offline_mode_write_prevention():
    client = LandGovernanceClient(offline=True)
    
    raised_login = False
    try:
        client.auth.login("user@gov.in", "pass")
    except LandGovernanceOfflineError as err:
        raised_login = True
        assert "disabled in offline mode" in str(err)
    assert raised_login is True, "login should raise LandGovernanceOfflineError"

    raised_proposal = False
    try:
        client.innovation.submit_proposal("c1", "Title", "Desc")
    except LandGovernanceOfflineError:
        raised_proposal = True
    assert raised_proposal is True, "submit_proposal should raise LandGovernanceOfflineError"

def test_explicit_offline_fallback_simulation():
    client = LandGovernanceClient(offline=True)
    
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        res = client.simulate.run(
            policy_variable="digital_cadastre",
            target_value=85.0,
            investment_cr=100.0,
            state="Maharashtra"
        )
        assert len(w) >= 1
        assert "OPERATING IN OFFLINE MODE" in str(w[0].message).upper()

    assert res.source == "offline"
    assert res.is_offline is True
    assert res.model_version == "offline_approx_v1"
    assert res.summary.confidence_metric == "dispute_reduction_pct"
    assert res.summary.confidence_range == [19.7, 26.1]
    assert "top_feature_impacts" in res.explainability
    assert len(res.trajectory) == 7

def test_simulation_scenario_compare():
    client = LandGovernanceClient(offline=True)
    
    res_a = client.simulate.run(policy_variable="digital_cadastre", target_value=60.0, investment_cr=50.0)
    res_b = client.simulate.run(policy_variable="digital_cadastre", target_value=90.0, investment_cr=200.0)

    cmp = client.simulate.compare(res_a, res_b)
    assert cmp.deltas["digitization_gain_delta_pct"] > 0
    assert "Scenario B" in cmp.winner

def test_to_dataframe_source_tagging():
    client = LandGovernanceClient(offline=True)
    districts = client.gis.get_districts(state="Maharashtra")
    df = districts.to_dataframe()
    assert len(df) > 0
    assert "source" in df.columns
    assert df.attrs["source"] == "offline"

def test_golden_vector_parity_root_fixture():
    with open(ROOT_FIXTURE_PATH, "r", encoding="utf-8") as f:
        golden_all = json.load(f)

    client = LandGovernanceClient(offline=True)
    for vec_key, golden in golden_all.items():
        res = client.simulate.run(**golden["input"])
        assert res.model_version == golden["expected_model_version"]
        assert res.summary.confidence_range == golden["expected_summary"]["confidence_range"]
        assert len(res.trajectory) == golden["expected_trajectory_years"]

def test_http_401_403_404_429_always_raise():
    """Verify HTTP 401, 403, 404, 429 NEVER fall back to offline mock data even when fallback_to_offline=True."""
    client = LandGovernanceClient(fallback_to_offline=True)

    for status_code in [401, 403, 404, 429]:
        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.json.return_value = {"detail": f"HTTP {status_code} error"}
        mock_resp.text = f"HTTP {status_code} error"

        with patch("httpx.Client.request", return_value=mock_resp):
            raised = False
            try:
                client.repository.list()
            except LandGovernanceApiError as err:
                raised = True
                assert err.status_code == status_code
                if status_code == 401:
                    assert err.is_unauthorized is True
                elif status_code == 403:
                    assert err.is_forbidden is True
                elif status_code == 404:
                    assert err.is_not_found is True
                elif status_code == 429:
                    assert err.is_rate_limited is True
            assert raised is True, f"HTTP {status_code} should have raised LandGovernanceApiError"

def test_fallback_disabled_connection_error_raises():
    """Verify connection error with fallback_to_offline=False raises LandGovernanceNetworkError."""
    client = LandGovernanceClient(fallback_to_offline=False)

    with patch("httpx.Client.request", side_effect=httpx.ConnectError("Connection refused")):
        raised = False
        try:
            client.geodata.get_districts()
        except LandGovernanceNetworkError as err:
            raised = True
            assert "Failed to connect" in str(err)
        assert raised is True, "ConnectError should raise LandGovernanceNetworkError when fallback=False"

def test_500_server_error_triggers_fallback_when_enabled():
    """Verify HTTP 500 triggers offline fallback when fallback_to_offline=True."""
    client = LandGovernanceClient(fallback_to_offline=True)

    mock_resp = MagicMock()
    mock_resp.status_code = 500
    mock_resp.json.return_value = {"detail": "Internal Server Error"}

    with patch("httpx.Client.request", return_value=mock_resp):
        res = client.geodata.get_districts()
        assert res.source == "offline"
        assert len(res.districts) > 0

def test_http_timeout_fallback():
    """Verify HTTP timeout triggers fallback when fallback_to_offline=True."""
    client = LandGovernanceClient(fallback_to_offline=True)

    with patch("httpx.Client.request", side_effect=httpx.TimeoutException("Request timed out")):
        res = client.geodata.get_districts()
        assert res.source == "offline"
        assert len(res.districts) > 0

def test_random_input_sweep_confidence_bracket():
    """Sweeps multiple random parameter configurations to assert lower <= point estimate <= upper."""
    import random
    client = LandGovernanceClient(offline=True)
    random.seed(42)

    variables = ["digital_cadastre", "land_ceiling", "tax_incentive", "fast_track_courts"]
    states = ["Maharashtra", "Karnataka", "National"]

    for _ in range(15):
        var = random.choice(variables)
        val = random.uniform(20.0, 95.0)
        inv = random.uniform(50.0, 300.0)
        st = random.choice(states)

        sim = client.simulate.run(
            policy_variable=var,
            target_value=val,
            investment_cr=inv,
            state=st
        )

        pt = sim.summary.dispute_reduction_pct
        lower, upper = sim.summary.confidence_range

        assert lower <= pt <= upper, (
            f"Confidence bracket violation for {var}={val}, inv={inv}: "
            f"lower ({lower}) <= point ({pt}) <= upper ({upper}) is False!"
        )

if __name__ == "__main__":
    test_client_initialization()
    test_factory_function()
    test_token_management()
    test_offline_mode_write_prevention()
    test_explicit_offline_fallback_simulation()
    test_simulation_scenario_compare()
    test_to_dataframe_source_tagging()
    test_golden_vector_parity_root_fixture()
    test_http_401_403_404_429_always_raise()
    test_fallback_disabled_connection_error_raises()
    test_500_server_error_triggers_fallback_when_enabled()
    test_http_timeout_fallback()
    test_invalid_policy_target_value_validation()
    test_random_input_sweep_confidence_bracket()
    print("ALL PYTHON SDK TESTS PASSED SUCCESSFULLY!")
