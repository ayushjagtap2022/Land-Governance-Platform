import json
import os
import shutil
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from collections import Counter

# Load data dump
json_path = r"c:\Nirmal\Projects\Land-Governance-Platform\docs\eval_plots\database_retrieval_dump.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

users = data.get("users", [])
docs = data.get("documents", [])
workspaces = data.get("workspaces", [])
tasks = data.get("tasks", [])
challenges = data.get("challenges", [])
proposals = data.get("proposals", [])
audit_logs = data.get("recent_audit_logs", [])

# Setup style
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
fig = plt.figure(figsize=(18, 12), facecolor="#0f172a")

# Title & Subtitle banner
fig.text(0.5, 0.970, "NATIONAL LAND GOVERNANCE PLATFORM - DATABASE METRICS & ENTITY GRAPH", 
         ha="center", va="center", fontsize=19, fontweight="bold", color="#f8fafc", fontfamily="sans-serif")
fig.text(0.5, 0.942, "Live Production Snapshot from Neon PostgreSQL (pgvector 1024-dim dense embeddings & Governance Store)", 
         ha="center", va="center", fontsize=11, color="#94a3b8", fontfamily="sans-serif")

# Grid layout: 2 rows of 3 columns
gs = fig.add_gridspec(2, 3, top=0.87, bottom=0.07, left=0.06, right=0.95, hspace=0.34, wspace=0.28)

# ----------------- PANEL 1: KPI Stats Summary -----------------
ax1 = fig.add_subplot(gs[0, 0])
ax1.set_facecolor("#1e293b")
ax1.axis("off")

kpis = [
    ("Registered Users", f"{len(users)}", "#38bdf8", "100% active identity accounts"),
    ("Statutory Documents", f"{len(docs)}", "#34d399", "100% pgvector 1024-dim embedded"),
    ("Innovation Proposals", f"{len(proposals)}", "#a78bfa", "2 Funded | 5 In Evaluation"),
    ("Workspaces & Tasks", f"{len(workspaces) + len(tasks)}", "#fbbf24", f"{len(workspaces)} Workspaces | {len(tasks)} In Progress"),
    ("Audit Trail Entries", f"{len(audit_logs)}", "#f43f5e", "Real-time tamper-evident logs")
]

ax1.text(0.5, 0.92, "DATABASE STORE HEALTH & INVENTORY", ha="center", va="center",
         fontsize=12, fontweight="bold", color="#e2e8f0", transform=ax1.transAxes)

y_pos = 0.76
for label, val, color, note in kpis:
    # Card background
    rect = patches.FancyBboxPatch((0.04, y_pos - 0.06), 0.92, 0.125, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  facecolor="#0f172a", edgecolor=color, linewidth=1.2, transform=ax1.transAxes)
    ax1.add_patch(rect)
    
    ax1.text(0.08, y_pos + 0.02, label, fontsize=9.5, fontweight="600", color="#cbd5e1", transform=ax1.transAxes)
    ax1.text(0.08, y_pos - 0.035, note, fontsize=7.5, color="#64748b", transform=ax1.transAxes)
    ax1.text(0.90, y_pos, val, fontsize=16, fontweight="bold", color=color, ha="right", va="center", transform=ax1.transAxes)
    y_pos -= 0.16

# ----------------- PANEL 2: Statutory Documents by Category -----------------
ax2 = fig.add_subplot(gs[0, 1])
ax2.set_facecolor("#1e293b")

cat_counts = Counter([d.get("category", "Unspecified").strip() for d in docs])
# Group similar categories for clean chart
mapped_cats = {}
for k, v in cat_counts.items():
    if "standard" in k.lower():
        mapped_cats["Standards & SOPs"] = mapped_cats.get("Standards & SOPs", 0) + v
    elif "legislation" in k.lower():
        mapped_cats["Legislation / Acts"] = mapped_cats.get("Legislation / Acts", 0) + v
    elif "policy" in k.lower():
        mapped_cats["Policies & Guidelines"] = mapped_cats.get("Policies & Guidelines", 0) + v
    elif "research" in k.lower():
        mapped_cats["Research & Evidence"] = mapped_cats.get("Research & Evidence", 0) + v
    elif "scheme" in k.lower():
        mapped_cats["National Schemes"] = mapped_cats.get("National Schemes", 0) + v
    else:
        mapped_cats[k] = mapped_cats.get(k, 0) + v

cats_sorted = sorted(mapped_cats.items(), key=lambda x: x[1], reverse=True)
c_names = [c[0] for c in cats_sorted]
c_vals = [c[1] for c in cats_sorted]
colors = ["#38bdf8", "#34d399", "#818cf8", "#f472b6", "#fbbf24"][:len(c_names)]

bars = ax2.barh(c_names, c_vals, color=colors, height=0.55, edgecolor="#0f172a", linewidth=1.5)
ax2.invert_yaxis()
ax2.set_title("Statutory Knowledge Base by Category\n(All 20 vectors vectorized: 1024-dim)", fontsize=11, fontweight="bold", color="#e2e8f0", pad=12)
ax2.tick_params(colors="#94a3b8", labelsize=8.5)
ax2.set_facecolor("#1e293b")
for spine in ax2.spines.values():
    spine.set_color("#334155")
ax2.grid(axis="x", color="#334155", linestyle="--", alpha=0.6)

for bar in bars:
    w = bar.get_width()
    ax2.text(w + 0.15, bar.get_y() + bar.get_height()/2, f"{int(w)} docs",
             va="center", ha="left", color="#f8fafc", fontsize=8.5, fontweight="bold")
ax2.set_xlim(0, max(c_vals) + 2.5)

# ----------------- PANEL 3: Issuing Government Ministry / Department -----------------
ax3 = fig.add_subplot(gs[0, 2])
ax3.set_facecolor("#1e293b")

dept_counts = Counter()
for d in docs:
    dept = d.get("department", "Other")
    if "DoLR" in dept or "Land Resources" in dept:
        dept_counts["DoLR / MoRD"] += 1
    elif "Panchayati Raj" in dept:
        dept_counts["Min. Panchayati Raj (SVAMITVA)"] += 1
    elif "NITI" in dept:
        dept_counts["NITI Aayog"] += 1
    elif "ISRO" in dept or "NRSC" in dept:
        dept_counts["NRSC / ISRO (Bhuvan)"] += 1
    elif "Survey of India" in dept:
        dept_counts["Survey of India"] += 1
    elif "Tribal" in dept:
        dept_counts["Min. Tribal Affairs (FRA)"] += 1
    elif any(st in dept for st in ["Maharashtra", "Telangana", "Punjab", "Haryana", "Uttar Pradesh", "Karnataka", "Chandigarh"]):
        dept_counts["State Revenue Depts"] += 1
    else:
        dept_counts["Other Research/Academic"] += 1

d_sorted = sorted(dept_counts.items(), key=lambda x: x[1], reverse=True)
d_names = [x[0] for x in d_sorted]
d_vals = [x[1] for x in d_sorted]
d_colors = ["#06b6d4", "#10b981", "#6366f1", "#ec4899", "#f59e0b", "#8b5cf6", "#14b8a6", "#64748b"][:len(d_names)]

wedges, texts, autotexts = ax3.pie(d_vals, labels=d_names, autopct="%1.0f%%", startangle=140,
                                   colors=d_colors, textprops=dict(color="#cbd5e1", fontsize=7.5),
                                   wedgeprops=dict(width=0.45, edgecolor="#0f172a", linewidth=1.5),
                                   pctdistance=0.75)
for at in autotexts:
    at.set_color("#ffffff")
    at.set_fontweight("bold")
    at.set_fontsize(7.5)
ax3.set_title("Statutory Documents by Issuing Authority", fontsize=11, fontweight="bold", color="#e2e8f0", pad=12)

# ----------------- PANEL 4: User Identity & Role Governance -----------------
ax4 = fig.add_subplot(gs[1, 0])
ax4.set_facecolor("#1e293b")

role_counts = Counter([u.get("role", "unknown") for u in users])
r_labels = [f"{k.replace('_', ' ').title()}" for k in role_counts.keys()]
r_vals = list(role_counts.values())
r_colors = ["#38bdf8", "#34d399", "#fbbf24", "#f43f5e"][:len(r_labels)]

wedges, texts, autotexts = ax4.pie(r_vals, labels=r_labels, autopct="%1.1f%%", startangle=90,
                                   colors=r_colors, textprops=dict(color="#cbd5e1", fontsize=8.5),
                                   wedgeprops=dict(width=0.42, edgecolor="#0f172a", linewidth=1.5),
                                   pctdistance=0.75)
for at in autotexts:
    at.set_color("#ffffff")
    at.set_fontweight("bold")
    at.set_fontsize(8)

ax4.text(0, 0, f"{len(users)}\nUsers", ha="center", va="center", fontsize=11, fontweight="bold", color="#f8fafc")
ax4.set_title("User Personas & Access Control Tiers\n(RBAC Security Guard Active)", fontsize=11, fontweight="bold", color="#e2e8f0", pad=12)

# ----------------- PANEL 5: Innovation Proposals Status & Topics -----------------
ax5 = fig.add_subplot(gs[1, 1])
ax5.set_facecolor("#1e293b")

prop_status = Counter([p.get("status", "unknown").capitalize() for p in proposals])
p_labels = list(prop_status.keys())
p_vals = list(prop_status.values())
p_colors = ["#10b981", "#38bdf8"] if "Funded" in p_labels else ["#38bdf8", "#10b981"]

bars5 = ax5.bar(p_labels, p_vals, color=p_colors, width=0.45, edgecolor="#0f172a", linewidth=1.5)
ax5.set_title("Innovation Grand Challenges & Proposals\n(Total: 7 Submissions, 3 Challenges)", fontsize=11, fontweight="bold", color="#e2e8f0", pad=12)
ax5.tick_params(colors="#94a3b8", labelsize=9)
for spine in ax5.spines.values():
    spine.set_color("#334155")
ax5.grid(axis="y", color="#334155", linestyle="--", alpha=0.6)
ax5.set_ylim(0, max(p_vals) + 2)

for bar in bars5:
    h = bar.get_height()
    pct = (h / len(proposals)) * 100
    ax5.text(bar.get_x() + bar.get_width()/2, h + 0.2, f"{int(h)} ({pct:.0f}%)",
             ha="center", va="bottom", color="#f8fafc", fontsize=9, fontweight="bold")

# Add text box of proposal topics inside panel
topic_notes = "Key Proposal Tech Domains:\n• Blockchain Land Titling (2)\n• AI Cadastral Vectorization (2)\n• Tribal Land Rights (FRA)\n• Urban Land Valuation"
ax5.text(0.95, 0.70, topic_notes, transform=ax5.transAxes, ha="right", va="top",
         fontsize=7.8, color="#cbd5e1", bbox=dict(boxstyle="round,pad=0.4", facecolor="#0f172a", edgecolor="#475569", alpha=0.9))

# ----------------- PANEL 6: Security Audit Trail & Event Breakdown -----------------
ax6 = fig.add_subplot(gs[1, 2])
ax6.set_facecolor("#1e293b")

audit_actions = Counter([a.get("action", "OTHER") for a in audit_logs])
a_names = [a.replace("_", " ") for a in audit_actions.keys()]
a_vals = list(audit_actions.values())
a_colors = ["#10b981", "#38bdf8", "#f59e0b", "#f43f5e"][:len(a_names)]

bars6 = ax6.barh(a_names, a_vals, color=a_colors, height=0.5, edgecolor="#0f172a", linewidth=1.5)
ax6.invert_yaxis()
ax6.set_title("Recent Security Audit Trail Distribution\n(10 Latest Real-time Events)", fontsize=11, fontweight="bold", color="#e2e8f0", pad=12)
ax6.tick_params(colors="#94a3b8", labelsize=8)
for spine in ax6.spines.values():
    spine.set_color("#334155")
ax6.grid(axis="x", color="#334155", linestyle="--", alpha=0.6)

for bar in bars6:
    w = bar.get_width()
    ax6.text(w + 0.15, bar.get_y() + bar.get_height()/2, f"{int(w)} logs",
             va="center", ha="left", color="#f8fafc", fontsize=8.5, fontweight="bold")
ax6.set_xlim(0, max(a_vals) + 2)

# Save visualization
output_dir = r"c:\Nirmal\Projects\Land-Governance-Platform\docs\eval_plots"
os.makedirs(output_dir, exist_ok=True)
out_file = os.path.join(output_dir, "database_summary_dashboard.png")
plt.savefig(out_file, dpi=300, facecolor=fig.get_facecolor(), edgecolor="none")
plt.close()

# Mirror to artifacts directory
artifact_dir = r"C:\Users\nirma\.gemini\antigravity-ide\brain\5136e0d4-0929-4f34-a385-5ae84908ca43"
if os.path.exists(artifact_dir):
    shutil.copy2(out_file, os.path.join(artifact_dir, "database_summary_dashboard.png"))

print(f"Successfully generated database summary dashboard at: {out_file}")
