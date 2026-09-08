"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";

interface EdaChartsProps {
  monthlySeries: any[];
  frpHistogram: any[];
  frpPercentiles: any;
  tiScatter: any[];
  corrMatrix: any;
}

const TABS = ["Timeline", "FRP Dist.", "Ti4 vs Ti5", "Correlations"] as const;

const tooltipStyle = {
  backgroundColor: "#0d1017",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  fontSize: "11px",
  fontFamily: "monospace",
};

export const EdaChartsClient: React.FC<EdaChartsProps> = ({
  monthlySeries, frpHistogram, frpPercentiles, tiScatter, corrMatrix,
}) => {
  const [tab, setTab] = useState<typeof TABS[number]>("Timeline");

  return (
    <div className="rounded-lg border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-[11px] mono font-medium transition-colors ${
              tab === t ? "text-white font-semibold" : "text-[#5c5e6a] hover:text-[#8b8d98]"
            }`}
            style={tab === t ? { background: "var(--accent-dim)", color: "#f97316" } : undefined}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-[10px] mono" style={{ color: "var(--text-tertiary)" }}>
          NASA FIRMS 2023–2024
        </span>
      </div>

      <div className="p-4">
        {tab === "Timeline" && (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                <YAxis yAxisId="left" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={10} fontFamily="monospace" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar yAxisId="left" dataKey="scaled_count" name="Detections" fill="#1e2130" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="mean_frp" name="FRP (MW)" stroke="#f97316" strokeWidth={2} dot={{ r: 2.5, fill: "#f97316" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "FRP Dist." && (
          <div className="space-y-4">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frpHistogram} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="bin" stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#5c5e6a" fontSize={10} fontFamily="monospace" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Count" radius={[3, 3, 0, 0]}>
                    {frpHistogram.map((_: any, i: number) => (
                      <Cell key={i} fill={i > 4 ? "#ef4444" : i > 2 ? "#f97316" : "#eab308"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mono text-[10px]">
              {["min", "p25", "median", "p75", "p95", "max"].map((k) => (
                <span key={k} className="px-2 py-1 rounded border" style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                  {k}: <span className="text-white font-semibold">{frpPercentiles[k]} MW</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {tab === "Ti4 vs Ti5" && (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" dataKey="ti5" name="Ti5" domain={[270, 340]} stroke="#5c5e6a" fontSize={10} fontFamily="monospace" unit=" K" />
                <YAxis type="number" dataKey="ti4" name="Ti4" domain={[290, 370]} stroke="#5c5e6a" fontSize={10} fontFamily="monospace" unit=" K" />
                <ZAxis type="number" dataKey="frp" range={[15, 140]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Scatter data={tiScatter} fill="#f97316" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "Correlations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] mono border-collapse">
              <thead>
                <tr style={{ color: "var(--text-tertiary)" }}>
                  <th className="p-2 text-left font-medium">Variable</th>
                  <th className="p-2 text-right font-medium">FRP</th>
                  <th className="p-2 text-right font-medium">Temp</th>
                  <th className="p-2 text-right font-medium">Precip Def</th>
                  <th className="p-2 text-right font-medium">Soil</th>
                  <th className="p-2 text-right font-medium">Wind</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "frp", label: "FRP (MW)" },
                  { key: "temperature_c", label: "Temp (°C)" },
                  { key: "precip_deficit_mm", label: "Precip Deficit" },
                  { key: "soil_moisture_pct", label: "Soil (%)" },
                  { key: "wind_kmh", label: "Wind (km/h)" },
                ].map((row) => (
                  <tr key={row.key} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-2 font-medium text-white">{row.label}</td>
                    {["frp", "temperature_c", "precip_deficit_mm", "soil_moisture_pct", "wind_kmh"].map((col) => {
                      const cell = corrMatrix[row.key]?.[col];
                      const r = cell ? cell.pearson_r : 1;
                      return (
                        <td key={col} className={`p-2 text-right font-mono ${
                          col === row.key ? "text-[#5c5e6a]" : r > 0.3 ? "text-orange-400 font-semibold" : r < -0.3 ? "text-blue-400 font-semibold" : "text-[#8b8d98]"
                        }`}>
                          {r > 0 ? `+${r.toFixed(3)}` : r.toFixed(3)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
