"use client";

import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

interface MmdClientProps {
  data: any;
}

const TABS = ["PageRank", "DGIM", "FP-Growth", "PCY"] as const;

const tooltipStyle = {
  backgroundColor: "#0d1017",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  fontSize: "11px",
  fontFamily: "monospace",
};

export const MmdClient: React.FC<MmdClientProps> = ({ data }) => {
  const [tab, setTab] = useState<typeof TABS[number]>("PageRank");

  const pr = data.pagerank;
  const dgim = data.dgim;
  const fp = data.fpgrowth;
  const pcy = data.pcy;

  return (
    <div className="space-y-4">
      {/* Algorithm Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg border text-[12px] mono font-medium transition-colors ${
              tab === t ? "text-orange-400 font-semibold" : "text-[#5c5e6a] hover:text-[#8b8d98]"
            }`}
            style={{
              background: tab === t ? "var(--accent-dim)" : "var(--surface)",
              borderColor: tab === t ? "rgba(249,115,22,0.25)" : "var(--border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* PageRank */}
      {tab === "PageRank" && (
        <div className="space-y-4">
          <div className="flex gap-4 mono text-[11px]">
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Damping: <span className="text-white font-semibold">{pr.parameters.damping_factor}</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Converged: <span className="text-green-400 font-semibold">{pr.parameters.converged_iterations} iters</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Residual: <span className="text-white font-semibold">{pr.parameters.final_residual}</span>
            </span>
          </div>
          <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pr.top_nodes.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 16, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                  <YAxis dataKey="region" type="category" width={75} stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="pagerank_score" name="PageRank" radius={[0, 4, 4, 0]}>
                    {pr.top_nodes.slice(0, 12).map((_: any, i: number) => (
                      <Cell key={i} fill={i < 3 ? "#ef4444" : i < 6 ? "#f97316" : "#eab308"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DGIM */}
      {tab === "DGIM" && (
        <div className="space-y-4">
          <div className="flex gap-4 mono text-[11px]">
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Window: <span className="text-white font-semibold">{dgim.parameters.window_size} steps</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Threshold: <span className="text-white font-semibold">{dgim.parameters.threshold_mw} MW</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Error: <span className="text-green-400 font-semibold">≤{dgim.parameters.error_bound_pct}%</span>
            </span>
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <table className="w-full text-[11px] mono">
              <thead>
                <tr style={{ color: "var(--text-tertiary)" }}>
                  <th className="text-left p-3 font-medium">Metric</th>
                  <th className="text-right p-3 font-medium">DGIM</th>
                  <th className="text-right p-3 font-medium">Exact</th>
                  <th className="text-right p-3 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {dgim.stream_summary.map((row: any) => (
                  <tr key={row.metric} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3 text-white font-medium">{row.metric}</td>
                    <td className="p-3 text-right text-orange-400 font-semibold">{row.dgim_estimate}</td>
                    <td className="p-3 text-right" style={{ color: "var(--text-secondary)" }}>{row.exact_count}</td>
                    <td className="p-3 text-right text-green-400">{row.error_pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs p-3 rounded-lg border mono" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
            <span className="font-semibold text-white">Bucket State:</span> {JSON.stringify(dgim.bucket_state)}
          </div>
        </div>
      )}

      {/* FP-Growth */}
      {tab === "FP-Growth" && (
        <div className="space-y-4">
          <div className="flex gap-4 mono text-[11px]">
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              min_support: <span className="text-white font-semibold">{fp.parameters.min_support}</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              min_confidence: <span className="text-white font-semibold">{fp.parameters.min_confidence}</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Patterns: <span className="text-orange-400 font-semibold">{fp.parameters.frequent_patterns_found}</span>
            </span>
          </div>

          {/* Top Itemsets */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] mono uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>Frequent Itemsets</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {fp.top_frequent_itemsets.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 mono text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {item.itemset.map((tag: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span style={{ color: "var(--text-tertiary)" }}>sup: <span className="text-white font-semibold">{item.support}</span></span>
                    <span style={{ color: "var(--text-tertiary)" }}>cnt: <span className="text-white font-semibold">{item.count}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Association Rules */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] mono uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>Association Rules</span>
            </div>
            <table className="w-full text-[11px] mono">
              <thead>
                <tr style={{ color: "var(--text-tertiary)" }}>
                  <th className="text-left p-3 font-medium">Antecedent → Consequent</th>
                  <th className="text-right p-3 font-medium">Conf</th>
                  <th className="text-right p-3 font-medium">Lift</th>
                  <th className="text-right p-3 font-medium">Conviction</th>
                </tr>
              </thead>
              <tbody>
                {fp.association_rules.map((rule: any, i: number) => (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3">
                      <span className="text-orange-400">{rule.antecedent.join(" + ")}</span>
                      <span className="mx-1.5" style={{ color: "var(--text-tertiary)" }}>→</span>
                      <span className="text-white font-semibold">{rule.consequent.join(" + ")}</span>
                    </td>
                    <td className="p-3 text-right text-white font-semibold">{rule.confidence}</td>
                    <td className="p-3 text-right text-green-400 font-semibold">{rule.lift}</td>
                    <td className="p-3 text-right" style={{ color: "var(--text-secondary)" }}>{rule.conviction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PCY */}
      {tab === "PCY" && (
        <div className="space-y-4">
          <div className="flex gap-4 mono text-[11px]">
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Buckets: <span className="text-white font-semibold">{pcy.parameters.hash_buckets}</span>
            </span>
            <span className="px-2.5 py-1 rounded border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              Threshold: <span className="text-white font-semibold">{pcy.parameters.support_threshold}</span>
            </span>
          </div>

          {/* Performance */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <table className="w-full text-[11px] mono">
              <thead>
                <tr style={{ color: "var(--text-tertiary)" }}>
                  <th className="text-left p-3 font-medium">Pass</th>
                  <th className="text-right p-3 font-medium">Candidates</th>
                  <th className="text-right p-3 font-medium">Frequent</th>
                  <th className="text-right p-3 font-medium">Memory</th>
                  <th className="text-right p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {pcy.performance.map((row: any) => (
                  <tr key={row.pass} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-3 text-white font-semibold">{row.pass}</td>
                    <td className="p-3 text-right text-orange-400 font-semibold">{row.candidate_pairs.toLocaleString()}</td>
                    <td className="p-3 text-right text-white">{row.frequent_pairs}</td>
                    <td className="p-3 text-right" style={{ color: "var(--text-secondary)" }}>{row.memory_mb} MB</td>
                    <td className="p-3 text-right" style={{ color: "var(--text-secondary)" }}>{row.time_ms} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hash Bitmap */}
          <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-[10px] mono uppercase font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>Hash Bitmap Usage</div>
            <div className="flex items-center gap-3 mono text-[11px]">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${pcy.hash_bitmap.utilization_pct}%` }} />
              </div>
              <span className="text-white font-semibold">{pcy.hash_bitmap.utilization_pct}%</span>
            </div>
            <div className="flex gap-3 mt-2 text-[11px] mono" style={{ color: "var(--text-secondary)" }}>
              <span>Set: {pcy.hash_bitmap.bits_set.toLocaleString()}</span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>Total: {pcy.hash_bitmap.total_buckets.toLocaleString()}</span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>FP Rate: <span className="text-orange-400">{pcy.hash_bitmap.false_positive_rate}</span></span>
              <span style={{ color: "var(--border)" }}>|</span>
              <span>Pruned: <span className="text-green-400">{pcy.hash_bitmap.pruning_efficiency}</span></span>
            </div>
          </div>

          {/* Top Pairs */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[10px] mono uppercase font-semibold" style={{ color: "var(--text-tertiary)" }}>Top Co-occurring Pairs</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {pcy.top_pairs.map((pair: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 mono text-[11px]">
                  <span className="text-white">{pair.pair[0]} <span style={{ color: "var(--text-tertiary)" }}>×</span> {pair.pair[1]}</span>
                  <div className="flex gap-3" style={{ color: "var(--text-secondary)" }}>
                    <span>cnt: <span className="text-white font-semibold">{pair.count}</span></span>
                    <span>PMI: <span className="text-orange-400 font-semibold">{pair.pmi}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
