import React from "react";
import fs from "fs";
import path from "path";
import { MmdClient } from "./MmdClient";

function getData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "mmd_results.json"), "utf-8"));
  } catch { return null; }
}

export default function MmdPage() {
  const data = getData();
  if (!data) return <div className="p-8 text-[#5c5e6a] mono text-xs">Awaiting pipeline output.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">MMD Algorithms Engine</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          PageRank centrality, DGIM streaming bit-counts, FP-Growth association mining, and PCY hash-filtered pairs.
        </p>
      </div>
      <MmdClient data={data} />
    </div>
  );
}
