"use client";

import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Check } from "lucide-react";

interface SamplingClientProps {
  baseline: any;
  strategiesData: Record<string, any[]>;
}

const tooltipStyle = {
  backgroundColor: "#0d1017",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  fontSize: "11px",
  fontFamily: "monospace",
};

export const SamplingClient: React.FC<SamplingClientProps> = ({ baseline, strategiesData }) => {
  const strategyNames = Object.keys(strategiesData);
  const [selectedStrategy, setSelectedStrategy] = useState(strategyNames[1] || strategyNames[0]);
  const [selectedFraction, setSelectedFraction] = useState(0.10);

  const items = strategiesData[selectedStrategy] || [];
  const current = items.find((x) => x.fraction === selectedFraction) || items[2] || items[0];

  return (
    <div className="space-y-4">
      {/* Strategy Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {strategyNames.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedStrategy(s)}
            className={`p-3 rounded-lg border text-left text-[12px] mono transition-colors ${
              s === selectedStrategy ? "text-orange-400 font-semibold" : "text-[#8b8d98] hover:text-white"
            }`}
            style={{
              background: s === selectedStrategy ? "var(--accent-dim)" : "var(--surface)",
              borderColor: s === selectedStrategy ? "rgba(249,115,22,0.3)" : "var(--border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span>{s.split("(")[0].trim()}</span>
              {s === selectedStrategy && <Check className="h-3.5 w-3.5 text-orange-400" />}
            </div>
          </button>
        ))}
      </div>

      {/* Fraction Toggle */}
      <div className="flex items-center gap-2 mono text-[11px]">
        <span style={{ color: "var(--text-tertiary)" }}>FRACTION:</span>
        {[0.01, 0.05, 0.10, 0.25, 0.50].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFraction(f)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              f === selectedFraction ? "text-white font-bold" : "text-[#5c5e6a] hover:text-[#8b8d98]"
            }`}
            style={f === selectedFraction ? { background: "var(--surface-raised)" } : undefined}
          >
            {Math.round(f * 100)}%
          </button>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <table className="w-full text-[11px] mono">
          <thead>
            <tr style={{ color: "var(--text-tertiary)" }}>
              <th className="text-left p-3 font-medium">Metric</th>
              <th className="text-right p-3 font-medium">Full</th>
              <th className="text-right p-3 font-medium text-orange-400">Sample</th>
              <th className="text-right p-3 font-medium">Error</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Mean FRP", `${baseline.mean_frp} MW`, `${current.mean_frp} MW`, `${current.mean_frp_error_pct}%`],
              ["P95 FRP", `${baseline.p95_frp} MW`, `${current.p95_frp} MW`, `${current.p95_error_pct}%`],
              ["KS Statistic", "0.0000", current.ks_statistic, `p=${current.ks_p_value}`],
              ["Wasserstein", "0.00 MW", `${current.wasserstein_distance_mw} MW`, "EMD"],
              ["JS Divergence", "0.0000", current.jensen_shannon_divergence, "bits"],
              ["Geo Coverage", "100%", `${current.bbox_coverage_pct}%`, `Δ${(100 - current.bbox_coverage_pct).toFixed(1)}%`],
              ["Memory", `${baseline.memory_mb} MB`, `${current.memory_footprint_mb} MB`, `−${((1 - current.fraction) * 100).toFixed(0)}%`],
              ["Speedup", "1.0x", `${current.speedup_factor}x`, `${current.processing_time_ms} ms`],
            ].map(([metric, full, sample, err], i) => (
              <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="p-3 text-white font-medium">{metric}</td>
                <td className="p-3 text-right" style={{ color: "var(--text-secondary)" }}>{full}</td>
                <td className="p-3 text-right text-orange-400 font-semibold">{sample}</td>
                <td className="p-3 text-right text-green-400">{err}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trade-off Chart */}
      <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="fraction_label" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
              <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} fontFamily="monospace" />
              <YAxis yAxisId="right" orientation="right" stroke="#22c55e" fontSize={10} fontFamily="monospace" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
              <Line yAxisId="left" type="monotone" dataKey="wasserstein_distance_mw" name="Wasserstein (MW)" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="speedup_factor" name="Speedup (x)" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
