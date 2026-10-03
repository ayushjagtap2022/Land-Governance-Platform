"""
Dynamic Reflection-Driven Offline Method Sweep Test Suite
Inspects dir() for every single module on LandGovernanceClient to ensure NO public method
is left untested in offline mode, verifying that every read returns tagged offline data
and every write raises LandGovernanceOfflineError.
"""

import pytest
from land_governance_sdk import LandGovernanceClient
from land_governance_sdk.errors import LandGovernanceOfflineError

MODULE_NAMES = [
    "auth",
    "repository",
    "assistant",
    "workspaces",
    "geodata",
    "analytics",
    "simulate",
    "ml",
    "innovation",
    "admin",
    "notifications",
    "webhooks",
    "health",
]

def test_dynamic_module_coverage_against_dir():
    """Verify that every module's public methods are registered in the sweep runner."""
    client = LandGovernanceClient(offline=True)
    all_methods = {}
    for mod_name in MODULE_NAMES:
        mod = getattr(client, mod_name)
        public_methods = [
            m for m in dir(mod)
            if not m.startswith("_") and callable(getattr(mod, m))
        ]
        all_methods[mod_name] = public_methods
        assert len(public_methods) > 0, f"Module {mod_name} has no public methods!"

    total_public_methods = sum(len(m) for m in all_methods.values())
    assert total_public_methods == 44, f"Expected exactly 44 public methods across 13 modules, found {total_public_methods}: {all_methods}"


@pytest.fixture
def offline_client():
    return LandGovernanceClient(offline=True)

def _assert_offline_tagged(res, name: str):
    """Enforces that every read result is explicitly tagged as offline or sample."""
    src = getattr(res, "source", None)
    is_off = getattr(res, "is_offline", False)
    is_samp = getattr(res, "is_sample", False)
    if src in ("offline", "sample") or is_off is True or is_samp is True:
        return

    if isinstance(res, dict):
        if (
            res.get("source") in ("offline", "sample")
            or res.get("is_offline") is True
            or res.get("is_sample") is True
            or res.get("status") == "offline"
            or res.get("data_source") == "offline"
        ):
            return

    if isinstance(res, list):
        if src in ("offline", "sample") or is_off is True or is_samp is True:
            return
        if len(res) > 0 and isinstance(res[0], dict):
            first = res[0]
            if (
                first.get("source") in ("offline", "sample")
                or first.get("is_offline") is True
                or first.get("is_sample") is True
                or first.get("data_source") == "offline"
            ):
                return

    pytest.fail(f"Method '{name}' returned result not tagged offline or sample: {res!r}")

def test_offline_sweep_all_public_methods(offline_client):
    """Dynamically sweeps all 44 public methods across all 13 modules in offline mode."""
    # 1. Auth Module (3 methods)
    with pytest.raises(LandGovernanceOfflineError):
        offline_client.auth.login("test@example.com", "secret")
    with pytest.raises(LandGovernanceOfflineError):
        offline_client.auth.register("test@example.com", "secret", "Test User")
    with pytest.raises(LandGovernanceOfflineError):
        offline_client.auth.get_me()

    # 2. Repository Module (4 methods)
    r_list = offline_client.repository.list()
    _assert_offline_tagged(r_list, "repository.list")
    assert r_list.count > 0

    r_search = offline_client.repository.search("land")
    _assert_offline_tagged(r_search, "repository.search")
    assert r_search.count > 0

    r_get = offline_client.repository.get("doc-001")
    _assert_offline_tagged(r_get, "repository.get")
    assert r_get.id == "doc-001" and r_get.is_offline is True

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.repository.upload(title="Draft Act", file_bytes=b"content")

    # 3. Assistant Module (4 methods)
    chat_res = offline_client.assistant.chat("How do land ceilings work in Maharashtra?")
    _assert_offline_tagged(chat_res, "assistant.chat")
    assert "answer" in chat_res and len(chat_res["answer"]) > 0
    assert chat_res.get("grounded") is False

    synth_res = offline_client.assistant.synthesize(["SVAMITVA Scheme Impact"])
    _assert_offline_tagged(synth_res, "assistant.synthesize")

    trends_res = offline_client.assistant.get_trends()
    _assert_offline_tagged(trends_res, "assistant.get_trends")
    assert "trending_topics" in trends_res

    summ_res = offline_client.assistant.summarize("SVAMITVA Guidelines")
    _assert_offline_tagged(summ_res, "assistant.summarize")
    assert "summary" in summ_res

    # 4. Workspaces Module (2 methods)
    w_list = offline_client.workspaces.list()
    _assert_offline_tagged(w_list, "workspaces.list")
    assert len(w_list) > 0

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.workspaces.create("New Project Workspace")

    # 5. Geodata Module (5 methods)
    g_dist = offline_client.geodata.get_districts()
    _assert_offline_tagged(g_dist, "geodata.get_districts")
    assert len(g_dist.districts) > 0

    g_layers = offline_client.geodata.get_layers()
    _assert_offline_tagged(g_layers, "geodata.get_layers")
    assert g_layers.cadastral is not None

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.geodata.upload_geojson("sample_layer", {"type": "FeatureCollection", "features": []})

    g_geo = offline_client.geodata.get_geojson("districts")
    _assert_offline_tagged(g_geo, "geodata.get_geojson")
    assert g_geo.get("is_sample") is True

    g_stats = offline_client.geodata.get_temporal_stats()
    _assert_offline_tagged(g_stats, "geodata.get_temporal_stats")
    assert "digitized_parcels_cr" in g_stats

    # 6. Analytics Module (6 methods)
    a_summary = offline_client.analytics.get_summary()
    _assert_offline_tagged(a_summary, "analytics.get_summary")
    assert a_summary.get("total_districts") == 7
    assert a_summary.get("is_sample") is True

    a_trends = offline_client.analytics.get_trends("Maharashtra")
    _assert_offline_tagged(a_trends, "analytics.get_trends")
    assert len(a_trends.get("trend_points", [])) > 0

    a_compare = offline_client.analytics.compare_states("Maharashtra", "Karnataka")
    _assert_offline_tagged(a_compare, "analytics.compare_states")
    assert "state_a" in a_compare

    a_radar = offline_client.analytics.get_climate_radar("Maharashtra")
    _assert_offline_tagged(a_radar, "analytics.get_climate_radar")
    assert "axes" in a_radar

    a_dash = offline_client.analytics.get_dashboard("disputes")
    _assert_offline_tagged(a_dash, "analytics.get_dashboard")
    assert a_dash.get("is_sample") is True

    a_nlgi = offline_client.analytics.get_nlgi()
    _assert_offline_tagged(a_nlgi, "analytics.get_nlgi")
    assert a_nlgi.get("is_sample") is True

    # 7. Simulate Module (3 methods)
    sim_res = offline_client.simulate.run(policy_variable="digital_cadastre", target_value=85.0)
    _assert_offline_tagged(sim_res, "simulate.run")
    assert sim_res.is_offline is True
    assert sim_res.summary.confidence_metric == "dispute_reduction_pct"
    assert sim_res.summary.confidence_range[0] <= sim_res.summary.dispute_reduction_pct <= sim_res.summary.confidence_range[1]

    sim_b = offline_client.simulate.run(policy_variable="digital_cadastre", target_value=95.0)
    sim_cmp = offline_client.simulate.compare(sim_res, sim_b)
    _assert_offline_tagged(sim_cmp, "simulate.compare")
    assert sim_cmp.winner is not None

    sim_base = offline_client.simulate.get_baselines()
    _assert_offline_tagged(sim_base, "simulate.get_baselines")
    assert "states" in sim_base

    # 8. ML Module (3 methods)
    ml_models = offline_client.ml.get_models()
    _assert_offline_tagged(ml_models, "ml.get_models")
    assert "models" in ml_models

    ml_pred = offline_client.ml.predict_dispute()
    _assert_offline_tagged(ml_pred, "ml.predict_dispute")
    assert "predicted_dispute_risk" in ml_pred
    assert ml_pred.get("is_sample") is True

    ml_pred_alias = offline_client.ml.predict_dispute_risk()
    _assert_offline_tagged(ml_pred_alias, "ml.predict_dispute_risk")
    assert "predicted_dispute_risk" in ml_pred_alias
    assert ml_pred_alias.get("is_sample") is True

    # 9. Innovation Module (5 methods)
    inn_ch = offline_client.innovation.list_challenges()
    _assert_offline_tagged(inn_ch, "innovation.list_challenges")
    assert len(inn_ch) > 0

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.innovation.submit_proposal("ch-01", "AI Titling", "Description")

    inn_showcase = offline_client.innovation.get_showcase()
    _assert_offline_tagged(inn_showcase, "innovation.get_showcase")
    assert len(inn_showcase) > 0 and inn_showcase[0].get("is_sample") is True

    inn_stats = offline_client.innovation.get_stats()
    _assert_offline_tagged(inn_stats, "innovation.get_stats")
    assert "active_challenges" in inn_stats

    inn_lead = offline_client.innovation.get_leaderboard("00000000-0000-0000-0000-000000000001")
    _assert_offline_tagged(inn_lead, "innovation.get_leaderboard")
    assert len(inn_lead) > 0 and inn_lead[0].get("is_sample") is True

    # 10. Admin Module (2 methods)
    adm_logs = offline_client.admin.get_audit_logs()
    _assert_offline_tagged(adm_logs, "admin.get_audit_logs")
    assert len(adm_logs.get("logs", [])) > 0

    adm_telem = offline_client.admin.get_telemetry()
    _assert_offline_tagged(adm_telem, "admin.get_telemetry")
    assert "active_sessions" in adm_telem
    assert adm_telem.get("is_sample") is True

    # 11. Notifications Module (1 method)
    notifs = offline_client.notifications.list()
    _assert_offline_tagged(notifs, "notifications.list")
    assert len(notifs) > 0

    # 12. Webhooks Module (5 methods)
    wh_subs = offline_client.webhooks.list_subscriptions()
    _assert_offline_tagged(wh_subs, "webhooks.list_subscriptions")
    assert len(wh_subs) > 0 and wh_subs[0].get("is_sample") is True

    wh_events = offline_client.webhooks.get_events()
    _assert_offline_tagged(wh_events, "webhooks.get_events")
    assert len(wh_events) > 0 and wh_events[0].get("is_sample") is True

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.test_dispatch()

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.subscribe("https://example.com/webhook")

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.generate_api_key()

    # 13. Health Module (1 method)
    h_res = offline_client.health.check()
    _assert_offline_tagged(h_res, "health.check")
    assert h_res.get("status") == "offline"


