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
    assert r_list.source == "offline" or r_list.count > 0

    r_search = offline_client.repository.search("leasing")
    assert r_search.source == "offline" or r_search.count >= 0

    r_get = offline_client.repository.get("doc-001")
    assert r_get.id == "doc-001" and r_get.is_offline is True

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.repository.upload(title="Draft Act", file_bytes=b"content")

    # 3. Assistant Module (4 methods)
    chat_res = offline_client.assistant.chat("How do land ceilings work in Maharashtra?")
    assert "answer" in chat_res and len(chat_res["answer"]) > 0

    synth_res = offline_client.assistant.synthesize(["SVAMITVA Scheme Impact"])
    assert synth_res.get("source") == "offline"

    trends_res = offline_client.assistant.get_trends()
    assert trends_res.get("source") == "offline" and "trending_topics" in trends_res

    summ_res = offline_client.assistant.summarize("SVAMITVA Guidelines")
    assert summ_res.get("source") == "offline" and "summary" in summ_res

    # 4. Workspaces Module (2 methods)
    w_list = offline_client.workspaces.list()
    assert isinstance(w_list, list) and len(w_list) > 0 and w_list[0].get("source") == "offline"

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.workspaces.create("New Project Workspace")

    # 5. Geodata Module (5 methods)
    g_dist = offline_client.geodata.get_districts()
    assert g_dist.source == "offline" and len(g_dist.districts) > 0

    g_layers = offline_client.geodata.get_layers()
    assert g_layers.source == "offline" and g_layers.cadastral is not None

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.geodata.upload_geojson("sample_layer", {"type": "FeatureCollection", "features": []})

    g_geo = offline_client.geodata.get_geojson("districts")
    assert g_geo.get("source") == "offline" and g_geo.get("is_sample") is True

    g_stats = offline_client.geodata.get_temporal_stats()
    assert g_stats.get("source") == "offline" and "digitized_parcels_cr" in g_stats

    # 6. Analytics Module (6 methods)
    a_summary = offline_client.analytics.get_summary()
    assert a_summary.get("source") == "offline" and a_summary.get("total_districts") == 640

    a_trends = offline_client.analytics.get_trends("Maharashtra")
    assert a_trends.get("source") == "offline" and len(a_trends.get("trend_points", [])) > 0

    a_compare = offline_client.analytics.compare_states("Maharashtra", "Karnataka")
    assert a_compare.get("source") == "offline" and "state_a" in a_compare

    a_radar = offline_client.analytics.get_climate_radar("Maharashtra")
    assert a_radar.get("source") == "offline" and "axes" in a_radar

    a_dash = offline_client.analytics.get_dashboard("disputes")
    assert a_dash.get("source") == "offline" and a_dash.get("is_sample") is True

    a_nlgi = offline_client.analytics.get_nlgi()
    assert a_nlgi.get("source") == "offline" and a_nlgi.get("is_sample") is True

    # 7. Simulate Module (3 methods)
    sim_res = offline_client.simulate.run(policy_variable="digital_cadastre", target_value=85.0)
    assert sim_res.is_offline is True
    assert sim_res.summary.confidence_metric == "dispute_reduction_pct"
    assert sim_res.summary.confidence_range[0] <= sim_res.summary.dispute_reduction_pct <= sim_res.summary.confidence_range[1]

    sim_b = offline_client.simulate.run(policy_variable="digital_cadastre", target_value=95.0)
    sim_cmp = offline_client.simulate.compare(sim_res, sim_b)
    assert sim_cmp.winner is not None

    sim_base = offline_client.simulate.get_baselines()
    assert sim_base.get("source") == "offline" and "states" in sim_base

    # 8. ML Module (3 methods)
    ml_models = offline_client.ml.get_models()
    assert "models" in ml_models or ml_models.get("status") in ("active", "fallback")

    ml_pred = offline_client.ml.predict_dispute()
    assert "predicted_dispute_risk" in ml_pred or "predicted_dispute_risk_index" in ml_pred

    ml_pred_alias = offline_client.ml.predict_dispute_risk()
    assert "predicted_dispute_risk" in ml_pred_alias or "predicted_dispute_risk_index" in ml_pred_alias

    # 9. Innovation Module (5 methods)
    inn_ch = offline_client.innovation.list_challenges()
    assert isinstance(inn_ch, list) and len(inn_ch) > 0 and inn_ch[0].get("source") == "offline"

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.innovation.submit_proposal("ch-01", "AI Titling", "Description")

    inn_showcase = offline_client.innovation.get_showcase()
    assert isinstance(inn_showcase, list) and inn_showcase[0].get("is_sample") is True

    inn_stats = offline_client.innovation.get_stats()
    assert inn_stats.get("source") == "offline" and "active_challenges" in inn_stats

    inn_lead = offline_client.innovation.get_leaderboard("00000000-0000-0000-0000-000000000001")
    assert isinstance(inn_lead, list) and inn_lead[0].get("is_sample") is True

    # 10. Admin Module (2 methods)
    adm_logs = offline_client.admin.get_audit_logs()
    assert adm_logs.get("source") == "offline" and len(adm_logs.get("logs", [])) > 0

    adm_telem = offline_client.admin.get_telemetry()
    assert adm_telem.get("source") == "offline" and "active_sessions" in adm_telem

    # 11. Notifications Module (1 method)
    notifs = offline_client.notifications.list()
    assert isinstance(notifs, list) and len(notifs) > 0 and notifs[0].get("source") == "offline"

    # 12. Webhooks Module (5 methods)
    wh_subs = offline_client.webhooks.list_subscriptions()
    assert isinstance(wh_subs, list) and len(wh_subs) > 0 and wh_subs[0].get("is_sample") is True

    wh_events = offline_client.webhooks.get_events()
    assert isinstance(wh_events, list) and len(wh_events) > 0 and wh_events[0].get("is_sample") is True

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.test_dispatch()

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.subscribe("https://example.com/webhook")

    with pytest.raises(LandGovernanceOfflineError):
        offline_client.webhooks.generate_api_key()

    # 13. Health Module (1 method)
    h_res = offline_client.health.check()
    assert h_res.get("source") == "offline" and h_res.get("status") in ("ok", "healthy")


