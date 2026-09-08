"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from "recharts";

interface RiskClientProps {
  data: any;
}

const tooltipStyle = {
  backgroundColor: "#0d1017",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  fontSize: "11px",
  fontFamily: "monospace",
};

const TIER_COLORS: Record<string, string> = {
  "Extreme": "#ef4444",
  "High": "#f97316",
  "Moderate": "#eab308",
  "Low": "#22c55e",
};

export const RiskClient: React.FC<RiskClientProps> = ({ data }) => {
  const perf = data.model_performance;
  const feats = data.feature_importance;
  const tiers = data.risk_tiers;
  const cal = data.calibration;

  return (
    <div className="space-y-4">
      {/* Performance Strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "ROC-AUC", value: perf.roc_auc, accent: true },
          { label: "Precision", value: perf.precision },
          { label: "Recall", value: perf.recall },
          { label: "F1 Score", value: perf.f1_score },
          { label: "Brier Score", value: perf.brier_score },
          { label: "Log Loss", value: perf.log_loss },
        ].map((m) => (
          <div key={m.label} className="px-4 py-3 rounded-lg border flex-1 min-w-[120px]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-[10px] mono uppercase" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
            <div className={`text-lg font-bold mono mt-0.5 ${m.accent ? "text-orange-400" : "text-white"}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Feature Importance + Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Feature Importance */}
        <div className="lg:col-span-3 rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-[10px] mono uppercase font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>Feature Importance</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feats} layout="vertical" margin={{ top: 0, right: 16, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                <YAxis dataKey="feature" type="category" width={75} stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]}>
                  {feats.map((_: any, i: number) => (
                    <Cell key={i} fill={i < 2 ? "#ef4444" : i < 4 ? "#f97316" : "#eab308"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="lg:col-span-2 rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-[10px] mono uppercase font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>Risk Distribution</div>
          <div className="space-y-3">
            {tiers.map((tier: any) => (
              <div key={tier.tier} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: TIER_COLORS[tier.tier] || "#5c5e6a" }} />
                <span className="text-xs mono flex-1 text-white">{tier.tier}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                  <div className="h-full rounded-full" style={{ width: `${tier.percentage}%`, background: TIER_COLORS[tier.tier] || "#5c5e6a" }} />
                </div>
                <span className="text-xs mono font-semibold text-white w-10 text-right">{tier.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Calibration Check */}
          <div className="mt-6">
            <div className="text-[10px] mono uppercase font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>Calibration</div>
            <div className="space-y-1.5">
              {cal.calibration_bins?.map((bin: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mono text-[11px]">
                  <span className="w-16 text-right" style={{ color: "var(--text-tertiary)" }}>{bin.bin_range}</span>
                  <span className="text-white font-semibold w-14 text-right">{bin.actual_rate}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>pred: {bin.predicted_mean}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix Compact */}
      <details className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <summary className="px-4 py-3 cursor-pointer text-[12px] mono font-semibold text-white list-none flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--accent-dim)", color: "#f97316" }}>DETAIL</span>
          Confusion Matrix & Threshold Analysis
        </summary>
        <div className="px-4 pb-4 pt-2 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "True Pos", value: perf.confusion_matrix?.tp || 0, color: "text-green-400" },
              { label: "True Neg", value: perf.confusion_matrix?.tn || 0, color: "text-green-400" },
              { label: "False Pos", value: perf.confusion_matrix?.fp || 0, color: "text-red-400" },
              { label: "False Neg", value: perf.confusion_matrix?.fn || 0, color: "text-red-400" },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-md" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] mono" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
                <div className={`text-lg font-bold mono mt-0.5 ${m.color}`}>{m.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="text-xs mono" style={{ color: "var(--text-secondary)" }}>
            Optimal threshold: <span className="text-white font-semibold">{perf.threshold}</span> | 
            Specificity: <span className="text-white font-semibold">{perf.specificity}</span>
          </div>
        </div>
      </details>
    </div>
  );
};
