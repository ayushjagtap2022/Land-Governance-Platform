"""
Land Governance Platform Python SDK - Side-by-Side Scenario Comparison Example
"""

from land_governance_sdk import LandGovernanceClient

def main():
    client = LandGovernanceClient(offline=True)

    print("Executing Scenario A (Baseline Cadastre Investment)...")
    scenario_a = client.simulation.run(
        policy_variable="digital_cadastre",
        target_value=60.0,
        investment_cr=50.0,
        state="Maharashtra"
    )

    print("Executing Scenario B (Aggressive DILRMP Drone + Revenue Courts)...")
    scenario_b = client.simulation.run(
        policy_variable="digital_cadastre",
        target_value=95.0,
        investment_cr=250.0,
        state="Maharashtra"
    )

    # Side-by-side comparison
    cmp = client.simulation.compare(scenario_a, scenario_b)
    print("\n--- Side-by-Side Policy Comparison Results ---")
    print(f" • Digitization Delta: {cmp.deltas['digitization_gain_delta_pct']:+} %")
    print(f" • Dispute Reduction Delta: {cmp.deltas['dispute_reduction_delta_pct']:+} %")
    print(f" • Litigation Savings Delta: Rs. {cmp.deltas['litigation_savings_delta_cr']:+} Cr")
    print(f" • Recommendation: {cmp.winner}")

if __name__ == "__main__":
    main()
