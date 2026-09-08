import React from "react";
import fs from "fs";
import path from "path";
import { AlertsClient } from "./AlertsClient";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "alerts_data.json"), "utf-8"));
  } catch { return null; }
}

export default function AlertsPage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting pipeline output.</div>;

  const summary = {
    critical_count: data.critical_count || 0,
    high_count: data.high_count || 0,
    moderate_count: data.medium_count || 0,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Active Alerts Feed</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {data.total_active_alerts || data.alerts.length} active alerts across monitored regions.
        </p>
      </div>
      <AlertsClient alerts={data.alerts} summary={summary} />
    </div>
  );
}
