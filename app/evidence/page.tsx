import React from "react";
import fs from "fs";
import path from "path";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "evidence_audit.json"), "utf-8"));
  } catch { return null; }
}

export default function EvidencePage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting pipeline output.</div>;

  const passed = data.audit_items?.filter((a: any) => a.result === "PASS").length || 0;
  const total = data.audit_items?.length || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Evidence Audit</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Formal validation of pipeline correctness across {total} checkpoints.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg mono text-[11px] font-semibold" style={{
          background: passed === total ? "var(--success-dim)" : "var(--warn-dim)",
          color: passed === total ? "#22c55e" : "#eab308",
        }}>
          {passed}/{total} checks passed
        </div>
      </div>

      <div className="space-y-2">
        {data.audit_items?.map((item: any, i: number) => (
          <details
            key={i}
            className="rounded-lg border overflow-hidden group"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 text-[12px] list-none">
              {item.result === "PASS" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : item.result === "FAIL" ? (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              <span className="text-[10px] mono font-bold px-1.5 py-0.5 rounded shrink-0" style={{
                background: item.result === "PASS" ? "var(--success-dim)" : item.result === "FAIL" ? "var(--ember-dim)" : "var(--warn-dim)",
                color: item.result === "PASS" ? "#22c55e" : item.result === "FAIL" ? "#ef4444" : "#eab308",
              }}>
                {item.component}
              </span>
              <span className="text-white font-medium flex-1">{item.check}</span>
              <span className="text-[10px] mono" style={{ color: "var(--text-tertiary)" }}>{item.result}</span>
            </summary>
            <div className="px-4 pb-3 pt-2 border-t mono text-[11px]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <div className="p-3 rounded-md" style={{ background: "var(--bg)" }}>
                <span className="text-white font-medium">Evidence: </span>{item.evidence}
              </div>
              {item.metric_value && (
                <div className="mt-2 text-[10px]">
                  Metric: <span className="text-orange-400 font-semibold">{item.metric_value}</span>
                  {item.threshold && <span> (threshold: {item.threshold})</span>}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
