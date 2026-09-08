"use client";

import React, { useState } from "react";
import { Bell, Filter } from "lucide-react";

interface AlertsClientProps {
  alerts: any[];
  summary: any;
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM"];

export const AlertsClient: React.FC<AlertsClientProps> = ({ alerts, summary }) => {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="space-y-4">
      {/* Summary Strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg border mono text-[11px]" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <span style={{ color: "var(--text-tertiary)" }}>CRITICAL: <span className="text-red-400 font-semibold">{summary.critical_count}</span></span>
        <span style={{ color: "var(--text-tertiary)" }}>HIGH: <span className="text-orange-400 font-semibold">{summary.high_count}</span></span>
        <span style={{ color: "var(--text-tertiary)" }}>MODERATE: <span className="text-yellow-400 font-semibold">{summary.moderate_count}</span></span>
        <span className="h-3 w-px" style={{ background: "var(--border)" }} />
        <span style={{ color: "var(--text-tertiary)" }}>TOTAL: <span className="text-white font-semibold">{alerts.length} active</span></span>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 mono text-[11px]">
        {["ALL", ...SEVERITY_ORDER].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-2.5 py-1.5 rounded-md transition-colors ${
              filter === s ? "text-white font-bold" : "text-[#5c5e6a] hover:text-[#8b8d98]"
            }`}
            style={filter === s ? { background: "var(--surface-raised)" } : undefined}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto" style={{ color: "var(--text-tertiary)" }}>{filtered.length} alerts</span>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="rounded-lg border px-4 py-3 flex items-start gap-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] mono font-bold shrink-0 mt-0.5 ${
              alert.severity === "CRITICAL" ? "text-red-400" : alert.severity === "HIGH" ? "text-orange-400" : "text-yellow-400"
            }`} style={{
              background: alert.severity === "CRITICAL" ? "var(--ember-dim)" : alert.severity === "HIGH" ? "var(--accent-dim)" : "var(--warn-dim)"
            }}>
              {alert.severity}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white">{alert.region_name}</span>
                <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg)", color: "var(--text-tertiary)" }}>{alert.category}</span>
              </div>
              <p className="text-[11px] mt-1 mono" style={{ color: "var(--text-secondary)" }}>{alert.metric_trigger}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{alert.cause}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] mono" style={{ color: "var(--text-tertiary)" }}>
                <span>{alert.timestamp}</span>
                <span style={{ color: "var(--border)" }}>|</span>
                <span>Confidence: <span className="text-white font-semibold">{alert.confidence_level}</span></span>
                <span style={{ color: "var(--border)" }}>|</span>
                <span className={`font-semibold ${alert.status === "ACTIVE" ? "text-red-400" : "text-yellow-400"}`}>{alert.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
