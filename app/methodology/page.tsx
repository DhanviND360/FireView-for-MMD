import React from "react";
import fs from "fs";
import path from "path";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "methodology.json"), "utf-8"));
  } catch { return null; }
}

export default function MethodologyPage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting pipeline output.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Methodology & Pipeline Architecture</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          End-to-end documentation of data acquisition, processing, and analytical methods.
        </p>
      </div>

      {/* Pipeline stages as collapsible sections */}
      {data.pipeline_stages?.map((stage: any, i: number) => (
        <details
          key={i}
          className="rounded-lg border overflow-hidden group"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          open={i === 0}
        >
          <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 text-[13px] list-none">
            <span className="text-[10px] mono font-bold h-5 w-5 flex items-center justify-center rounded shrink-0" style={{ background: "var(--accent-dim)", color: "#f97316" }}>
              {i + 1}
            </span>
            <span className="text-white font-semibold">{stage.stage_name}</span>
            <span className="text-[10px] mono ml-auto" style={{ color: "var(--text-tertiary)" }}>{stage.category}</span>
          </summary>
          <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs pt-3" style={{ color: "var(--text-secondary)" }}>{stage.description}</p>

            {/* Tools & Parameters */}
            {stage.tools && (
              <div className="flex flex-wrap gap-1.5">
                {stage.tools.map((tool: string, j: number) => (
                  <span key={j} className="px-2 py-0.5 rounded text-[10px] mono" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {stage.parameters && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mono text-[11px]">
                {Object.entries(stage.parameters).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-md" style={{ background: "var(--bg)" }}>
                    <span style={{ color: "var(--text-tertiary)" }}>{k}: </span>
                    <span className="text-white font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {stage.output && (
              <div className="text-[11px] mono p-2 rounded-md" style={{ background: "var(--bg)", color: "var(--text-secondary)" }}>
                <span className="text-orange-400 font-semibold">Output:</span> {stage.output}
              </div>
            )}
          </div>
        </details>
      ))}

      {/* References */}
      {data.references && (
        <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-[10px] mono uppercase font-semibold mb-3" style={{ color: "var(--text-tertiary)" }}>References</div>
          <div className="space-y-2">
            {data.references.map((ref: any, i: number) => (
              <div key={i} className="text-xs flex gap-2" style={{ color: "var(--text-secondary)" }}>
                <span className="text-[10px] mono shrink-0" style={{ color: "var(--text-tertiary)" }}>[{i + 1}]</span>
                <div>
                  <span className="text-white font-medium">{ref.title}</span>
                  {ref.authors && <span className="ml-1">— {ref.authors}</span>}
                  {ref.year && <span className="ml-1 mono text-[10px]">({ref.year})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
