"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Flame,
  Globe as GlobeIcon,
  Map as MapIcon,
  Bell,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Play,
  Pause,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { InteractiveGlobe } from "@/components/globe/InteractiveGlobe";

const LeafletFireMap = dynamic(
  () => import("@/components/map/LeafletFireMap").then((m) => m.LeafletFireMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-[#5c5e6a] mono text-xs">
        Loading tactical satellite map...
      </div>
    ),
  }
);

interface Region {
  id: string;
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  biome: string;
  detections: number;
  mean_frp: number;
  peak_frp: number;
  risk_tier: string;
  risk_score: number;
  vpd_kpa: number;
  temp_c: number;
  soil_pct: number;
  wind_kmh: number;
  trend_7d: string;
}

interface Alert {
  id: string;
  timestamp: string;
  category: string;
  severity: string;
  region_id: string;
  region_name: string;
  metric_trigger: string;
  cause: string;
  status: string;
  confidence_level: string;
}

interface Props {
  regions: Region[];
  alerts: Alert[];
}

export const DashboardClient: React.FC<Props> = ({ regions, alerts }) => {
  const [viewMode, setViewMode] = useState<"globe" | "map">("globe");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(regions[0] || null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [filterTier, setFilterTier] = useState<"ALL" | "EXTREME" | "HIGH" | "MODERATE">("ALL");
  const [globeAutoRotate, setGlobeAutoRotate] = useState(true);

  // Filter regions based on active tier
  const filteredRegions = regions.filter((r) => {
    if (filterTier === "EXTREME") return r.risk_tier.includes("Extreme") || r.risk_score > 80;
    if (filterTier === "HIGH") return r.risk_tier.includes("High") || (r.risk_score >= 55 && r.risk_score <= 80);
    if (filterTier === "MODERATE") return r.risk_tier.includes("Moderate") || r.risk_score < 55;
    return true;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none" style={{ background: "var(--bg)" }}>
      {/* Top Consolidated Header Bar */}
      <header
        className="flex items-center justify-between h-11 px-4 border-b shrink-0 z-30 mono text-[11px]"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Merged Telemetry Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded border text-[11px]"
            style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[#8b8d98]">TELEMETRY:</span>
            <span className="text-white font-semibold">4.81M obs</span>
            <span className="text-[#5c5e6a]">(1.22 GB)</span>
          </div>

          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border text-[11px]"
            style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
          >
            <span className="text-[#8b8d98]">FRP BASELINE:</span>
            <span className="text-white font-semibold">34.8 MW</span>
            <span className="text-[#5c5e6a]">day</span>
            <span className="text-[#5c5e6a]">/</span>
            <span className="text-white font-semibold">16.2 MW</span>
            <span className="text-[#5c5e6a]">night</span>
          </div>

          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px]"
            style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
          >
            <span className="text-[#8b8d98]">SECTORS:</span>
            <span className="text-orange-400 font-semibold">{regions.length} Monitored</span>
          </div>
        </div>

        {/* View Switcher & Alerts Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          {/* 3D Globe / 2D Tactical Map Switcher */}
          <div
            className="flex items-center p-0.5 rounded-lg border text-[11px]"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setViewMode("globe")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "globe"
                  ? "bg-orange-500 text-white font-semibold shadow-sm"
                  : "text-[#8b8d98] hover:text-white"
              }`}
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              <span>3D Globe</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === "map"
                  ? "bg-orange-500 text-white font-semibold shadow-sm"
                  : "text-[#8b8d98] hover:text-white"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>2D Map</span>
            </button>
          </div>

          {/* Active Alerts Pill */}
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors text-[11px]"
            style={{
              background: showAlerts ? "var(--ember-dim)" : "var(--surface-raised)",
              borderColor: showAlerts ? "rgba(239, 68, 68, 0.4)" : "var(--border)",
              color: "#ef4444",
            }}
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="font-semibold">{alerts.length} Anomalies</span>
            {showAlerts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </header>

      {/* Collapsible Alerts Dropdown */}
      {showAlerts && (
        <div
          className="border-b px-4 py-3 space-y-2 overflow-y-auto max-h-48 z-20"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] mono uppercase tracking-wider text-[#8b8d98]">
              Active Multi-Stream Risk Anomalies ({alerts.length})
            </span>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-[#5c5e6a] hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-2.5 p-2 rounded-md border mono text-[11px]"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    a.severity === "CRITICAL"
                      ? "text-red-400 bg-red-950/40 border border-red-800/50"
                      : a.severity === "HIGH"
                      ? "text-orange-400 bg-orange-950/40 border border-orange-800/50"
                      : "text-yellow-400 bg-yellow-950/40 border border-yellow-800/50"
                  }`}
                >
                  {a.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate">{a.region_name}</div>
                  <p className="text-[#8b8d98] text-[10px] truncate">{a.metric_trigger}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Map & Globe Viewport + Detail Drawer */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Primary View (Globe or Map) */}
        <div className="flex-1 relative h-full w-full bg-[#06070b]">
          {viewMode === "globe" ? (
            <div className="w-full h-full relative">
              <InteractiveGlobe
                firePoints={filteredRegions}
                onSelectPoint={(pt) => {
                  const match = regions.find((r) => r.id === pt.id || r.name === pt.name);
                  if (match) setSelectedRegion(match);
                }}
                selectedPointId={selectedRegion?.id}
                autoRotate={globeAutoRotate}
                showLabels={true}
              />

              {/* Floating Globe Controls Pill */}
              <div
                className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1 rounded-lg border mono text-[11px]"
                style={{
                  background: "rgba(13, 16, 23, 0.88)",
                  borderColor: "var(--border)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <button
                  onClick={() => setGlobeAutoRotate(!globeAutoRotate)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[#8b8d98] hover:text-white transition-colors"
                  title={globeAutoRotate ? "Pause orbit" : "Resume orbit"}
                >
                  {globeAutoRotate ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{globeAutoRotate ? "Orbiting" : "Paused"}</span>
                </button>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-[10px] text-[#5c5e6a] px-1.5">Drag to rotate · Click node</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              <LeafletFireMap
                regions={filteredRegions}
                onSelectRegion={(r) => setSelectedRegion(r)}
              />
            </div>
          )}

          {/* Floating Filter Pill (Merged Risk Index Filter) */}
          <div
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1 p-1 rounded-lg border mono text-[10px]"
            style={{
              background: "rgba(13, 16, 23, 0.92)",
              borderColor: "var(--border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-[#5c5e6a] uppercase px-2 font-semibold tracking-wider">Risk Filter:</span>
            {(["ALL", "EXTREME", "HIGH", "MODERATE"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-2 py-1 rounded transition-colors ${
                  filterTier === tier
                    ? "bg-white/15 text-white font-semibold"
                    : "text-[#8b8d98] hover:text-white"
                }`}
              >
                {tier === "EXTREME" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mr-1" />}
                {tier === "HIGH" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 mr-1" />}
                {tier === "MODERATE" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1" />}
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Detail Drawer for Selected Region */}
        {selectedRegion && (
          <aside
            className="w-[330px] sm:w-[360px] shrink-0 border-l flex flex-col z-20 transition-all duration-200"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b flex items-start justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] mono text-orange-400 font-bold">{selectedRegion.id}</span>
                  <span className="text-[10px] mono text-[#5c5e6a]">·</span>
                  <span className="text-[10px] mono text-[#8b8d98]">{selectedRegion.country}</span>
                </div>
                <h2 className="text-sm font-semibold text-white tracking-tight truncate mt-0.5">
                  {selectedRegion.name}
                </h2>
                <p className="text-[11px] text-[#8b8d98] mt-0.5">{selectedRegion.biome}</p>
              </div>

              <button
                onClick={() => setSelectedRegion(null)}
                className="p-1 rounded text-[#5c5e6a] hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close inspector"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 mono text-[11px]">
              {/* Risk Score Highlight Card */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  background: selectedRegion.risk_tier.includes("Extreme")
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(249, 115, 22, 0.08)",
                  borderColor: selectedRegion.risk_tier.includes("Extreme")
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(249, 115, 22, 0.25)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#8b8d98]">
                    Calibrated Risk Prediction
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      selectedRegion.risk_tier.includes("Extreme")
                        ? "text-red-400 bg-red-950/60"
                        : "text-orange-400 bg-orange-950/60"
                    }`}
                  >
                    {selectedRegion.risk_tier}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span
                    className={`text-3xl font-bold tracking-tight ${
                      selectedRegion.risk_tier.includes("Extreme") ? "text-red-400" : "text-orange-400"
                    }`}
                  >
                    {selectedRegion.risk_score}%
                  </span>
                  <span className="text-[10px] text-[#8b8d98]">Activity Probability</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${selectedRegion.risk_score}%`,
                      background: selectedRegion.risk_tier.includes("Extreme") ? "#ef4444" : "#f97316",
                    }}
                  />
                </div>
              </div>

              {/* Thermal & Satellite Detections */}
              <div
                className="p-3 rounded-lg border space-y-2.5"
                style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
              >
                <div className="text-[10px] uppercase font-semibold text-[#8b8d98] tracking-wider">
                  Thermal Radiative Power (VIIRS)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-[#5c5e6a]">Mean FRP</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{selectedRegion.mean_frp} MW</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5c5e6a]">Peak Observed</div>
                    <div className="text-sm font-semibold text-orange-400 mt-0.5">{selectedRegion.peak_frp} MW</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5c5e6a]">Satellite Hits</div>
                    <div className="text-xs font-medium text-white mt-0.5">{selectedRegion.detections} points</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5c5e6a]">7-Day Trend</div>
                    <div
                      className={`text-xs font-semibold mt-0.5 flex items-center gap-0.5 ${
                        selectedRegion.trend_7d.startsWith("+") ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {selectedRegion.trend_7d.startsWith("+") ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span>{selectedRegion.trend_7d}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Multi-Variable Telemetry */}
              <div
                className="p-3 rounded-lg border space-y-2.5"
                style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
              >
                <div className="text-[10px] uppercase font-semibold text-[#8b8d98] tracking-wider">
                  Environmental Drivers
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b8d98]">Surface Temperature</span>
                    <span className="text-white font-semibold">{selectedRegion.temp_c}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b8d98]">Vapor Pressure Deficit</span>
                    <span className="text-orange-400 font-semibold">{selectedRegion.vpd_kpa} kPa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b8d98]">Soil Moisture Deficit</span>
                    <span className="text-white font-semibold">{selectedRegion.soil_pct}% root-zone</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8b8d98]">Surface Wind Velocity</span>
                    <span className="text-white font-semibold">{selectedRegion.wind_kmh} km/h</span>
                  </div>
                </div>
              </div>

              {/* Coordinates & Geographic Reference */}
              <div
                className="p-2.5 rounded-lg border text-[10px] text-[#5c5e6a] flex items-center justify-between"
                style={{ background: "var(--bg)", borderColor: "var(--border)" }}
              >
                <span>GEO: {selectedRegion.lat.toFixed(2)}°N, {selectedRegion.lon.toFixed(2)}°E</span>
                <span className="text-[#8b8d98] font-medium">{selectedRegion.region}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
