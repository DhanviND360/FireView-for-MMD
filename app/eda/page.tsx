import React from "react";
import fs from "fs";
import path from "path";
import { EdaChartsClient } from "./EdaChartsClient";

function getEdaData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "eda_metrics.json"), "utf-8"));
  } catch { return null; }
}

export default function EdaPage() {
  const data = getEdaData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting dataset analysis.</div>;

  const { dataset_overview: ds, quality_audit: qa, diurnal_analysis: da, monthly_seasonality, frp_distribution, frp_histogram, temperature_scatter, correlation_matrix, eda_questions } = data;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Exploratory Data Analysis</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Sensor profiling, distribution analysis, and 5 structured scientific hypotheses.
        </p>
      </div>

      {/* Compact Overview Row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Instrument", value: "VIIRS 375m I-Band" },
          { label: "Observations", value: ds.scaled_total_observations.toLocaleString() },
          { label: "Size", value: `${ds.dataset_size_gb} GB` },
          { label: "Completeness", value: `${qa.completeness_score_pct}%`, accent: true },
          { label: "Day/Night Ratio", value: `${da.frp_day_night_ratio}x` },
          { label: "Median FRP", value: `${frp_distribution.median} MW` },
        ].map((m, i) => (
          <div key={i} className="p-3 rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-[10px] mono uppercase" style={{ color: "var(--text-tertiary)" }}>{m.label}</div>
            <div className={`text-sm font-semibold mono mt-0.5 ${m.accent ? "text-green-400" : "text-white"}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <EdaChartsClient
        monthlySeries={monthly_seasonality}
        frpHistogram={frp_histogram}
        frpPercentiles={frp_distribution}
        tiScatter={temperature_scatter}
        corrMatrix={correlation_matrix}
      />

      {/* EDA Questions — Collapsible */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white tracking-tight">Scientific Hypotheses</h2>
        {eda_questions.map((q: any) => (
          <details
            key={q.id}
            className="group rounded-lg border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 text-sm list-none">
              <span className="text-[10px] mono font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--accent-dim)", color: "#f97316" }}>
                {q.id}
              </span>
              <span className="text-white font-medium leading-snug">{q.question}</span>
            </summary>
            <div className="px-4 pb-4 space-y-3 text-xs border-t" style={{ borderColor: "var(--border)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <div className="p-3 rounded-md" style={{ background: "var(--bg)" }}>
                  <div className="text-[10px] mono uppercase font-semibold mb-1" style={{ color: "var(--text-tertiary)" }}>Method</div>
                  <p style={{ color: "var(--text-secondary)" }}>{q.analysis}</p>
                </div>
                <div className="p-3 rounded-md" style={{ background: "var(--bg)" }}>
                  <div className="text-[10px] mono uppercase font-semibold mb-1 text-orange-400">Finding</div>
                  <p className="mono text-[11px]" style={{ color: "var(--text-primary)" }}>{q.finding}</p>
                </div>
              </div>
              <div className="p-3 rounded-md" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] mono uppercase font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Interpretation</div>
                <p style={{ color: "var(--text-secondary)" }}>{q.interpretation}</p>
              </div>
              <div className="p-2.5 rounded-md text-[11px] mono border" style={{ background: "var(--warn-dim)", borderColor: "rgba(234,179,8,0.15)", color: "#eab308" }}>
                {q.distinction}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
