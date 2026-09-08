import React from "react";
import fs from "fs";
import path from "path";
import { SamplingClient } from "./SamplingClient";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "sampling_metrics.json"), "utf-8"));
  } catch { return null; }
}

export default function SamplingPage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting dataset analysis.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Sampling Strategies & Bias Evaluation</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Comparing SRS, Stratified, Spatial, and Temporal sampling across 5 fractions with formal divergence metrics.
        </p>
      </div>

      {/* Baseline Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg border mono text-[11px]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <span style={{ color: "var(--text-tertiary)" }}>FULL BASELINE:</span>
        <span className="text-white font-semibold">{data.full_dataset_baseline.total_records.toLocaleString()} records</span>
        <span className="h-3 w-px" style={{ background: "var(--border)" }} />
        <span className="text-white font-semibold">{data.full_dataset_baseline.mean_frp} MW</span>
        <span style={{ color: "var(--text-tertiary)" }}>mean FRP</span>
        <span className="h-3 w-px" style={{ background: "var(--border)" }} />
        <span className="text-white font-semibold">{data.full_dataset_baseline.p95_frp} MW</span>
        <span style={{ color: "var(--text-tertiary)" }}>P95</span>
        <span className="h-3 w-px" style={{ background: "var(--border)" }} />
        <span className="text-white font-semibold">{data.full_dataset_baseline.memory_mb} MB</span>
      </div>

      <SamplingClient baseline={data.full_dataset_baseline} strategiesData={data.strategies} />

      {/* Verdict */}
      <details className="rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-white list-none flex items-center gap-2">
          <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: "var(--success-dim)", color: "#22c55e" }}>VERDICT</span>
          "{data.scientific_verdict.core_question}"
        </summary>
        <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          <div className="text-xs mono pt-3" style={{ color: "var(--text-secondary)" }}>
            <span className="text-green-400 font-semibold">{data.scientific_verdict.scientific_verdict}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.scientific_verdict.detailed_conclusions.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-md text-xs" style={{ background: "var(--bg)" }}>
                <div className="font-semibold text-white mb-1">{c.dimension}</div>
                <p style={{ color: "var(--text-secondary)" }}>{c.finding}</p>
                <p className="mt-2 text-[11px] mono" style={{ color: "var(--text-tertiary)" }}>
                  <span className="text-white font-medium">MMD Impact:</span> {c.impact_on_mmd}
                </p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
