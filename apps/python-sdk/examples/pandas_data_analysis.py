"""
Land Governance Platform Python SDK - Pandas Analysis & Visualization Example
"""

from land_governance_sdk import LandGovernanceClient

def main():
    client = LandGovernanceClient(offline=True)

    # 1. Export Districts to Pandas DataFrame
    districts = client.gis.get_districts()
    df_districts = districts.to_dataframe()
    print("--- 640 District Indicators DataFrame ---")
    print(df_districts[["district", "state", "dispute_risk", "modernization_index"]].head(5))
    print("DataFrame Source Metadata:", df_districts.attrs.get("source"))

    # 2. Export Simulation Temporal Trajectory to DataFrame
    sim = client.simulation.run(
        policy_variable="digital_cadastre",
        target_value=90.0,
        investment_cr=250.0,
        state="Maharashtra"
    )
    df_trajectory = sim.to_dataframe()
    print("\n--- 2024-2030 Policy Simulation Trajectory DataFrame ---")
    print(df_trajectory[["year", "digitization_pct", "pending_dispute_rate_pct", "cumulative_savings_cr"]])
    print("Trajectory Model Version:", df_trajectory.attrs.get("model_version"))

if __name__ == "__main__":
    main()
