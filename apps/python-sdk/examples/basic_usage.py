"""
Land Governance Platform Python SDK - Quickstart Example
"""

from land_governance_sdk import create_client

def main():
    # 1. Initialize Client (Set offline=True for local demo without server)
    client = create_client(
        base_url="http://127.0.0.1:8000/api/v1",
        fallback_to_offline=True
    )

    # 2. Check Server Liveness
    health = client.health.check()
    print("System Status:", health)

    # 3. Query GIS Geodata (640 Districts)
    districts = client.gis.get_districts(state="Maharashtra")
    print(f"\nRetrieved {districts.count} districts (Source: {districts.source}).")
    for d in districts.districts[:3]:
        print(f" • {d.district} (Dispute Risk: {d.dispute_risk}%, Digitization: {d.modernization_index}%)")

    # 4. Search Central Policy Knowledge Repository
    docs = client.documents.search(query="drone survey", state="Maharashtra")
    print(f"\nFound {docs.count} matching policy guidelines.")
    if docs.documents:
        print(f"Top Match: {docs.documents[0].title} [{docs.documents[0].ref_id}]")

    # 5. Run Policy Simulation Model
    sim = client.simulation.run(
        policy_variable="digital_cadastre",
        target_value=85.0,
        investment_cr=150.0,
        state="Maharashtra"
    )
    print(f"\nPolicy Simulation Results (Source: {sim.source}, Model: {sim.model_version}):")
    print(f" • Digitization Gain: +{sim.summary.digitization_gain_pct}%")
    print(f" • Dispute Reduction: -{sim.summary.dispute_reduction_pct}%")
    print(f" • Litigation Savings: Rs. {sim.summary.projected_litigation_savings_cr} Cr")
    print(f" • 95% Confidence Interval: {sim.summary.confidence_range}")

if __name__ == "__main__":
    main()
