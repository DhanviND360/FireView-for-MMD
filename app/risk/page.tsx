import React from "react";
import fs from "fs";
import path from "path";
import { RiskClient } from "./RiskClient";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "risk_model.json"), "utf-8"));
  } catch { return null; }
}

export default function RiskPage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting pipeline output.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Fire-Activity Risk Model</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Calibrated logistic risk scoring with engineered features and formal validation metrics.
        </p>
      </div>
      <RiskClient data={data} />
    </div>
  );
}
