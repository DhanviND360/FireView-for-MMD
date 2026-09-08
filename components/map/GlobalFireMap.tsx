"use client";

import React, { useState, useMemo } from "react";
import { 
  Flame, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  ShieldAlert, 
  Thermometer, 
  Wind, 
  Droplets, 
  Activity, 
  X, 
  ChevronRight,
  Filter,
  Compass,
  Maximize2
} from "lucide-react";

export interface FireRegion {
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

interface GlobalFireMapProps {
  regions: FireRegion[];
  isHeroPreview?: boolean;
  onSelectRegion?: (region: FireRegion) => void;
}

export const GlobalFireMap: React.FC<GlobalFireMapProps> = ({
  regions,
  isHeroPreview = false,
  onSelectRegion,
}) => {
  // Map State
  const [zoomLevel, setZoomLevel] = useState<number>(isHeroPreview ? 1.4 : 1.2);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedRegion, setSelectedRegion] = useState<FireRegion | null>(regions[0] || null);
  
  // Layer Toggles
  const [showObservations, setShowObservations] = useState(true);
  const [showHeatZones, setShowHeatZones] = useState(true);
  const [showDensityGrid, setShowDensityGrid] = useState(false);
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  
  // Filters
  const [minFRP, setMinFRP] = useState<number>(0);
  const [selectedBiome, setSelectedBiome] = useState<string>("ALL");

  // Equirectangular Map Projection helper
  // Maps lat [-90, 90] and lon [-180, 180] into SVG coordinates (800x440)
  const project = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 440;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - center.x, y: e.clientY - center.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCenter({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 3.8));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 1.0));
  const handleReset = () => {
    setZoomLevel(1.2);
    setCenter({ x: 0, y: 0 });
  };

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (r.mean_frp < minFRP) return false;
      if (selectedBiome !== "ALL" && !r.biome.toLowerCase().includes(selectedBiome.toLowerCase())) return false;
      return true;
    });
  }, [regions, minFRP, selectedBiome]);

  const handleRegionClick = (r: FireRegion) => {
    setSelectedRegion(r);
    if (onSelectRegion) onSelectRegion(r);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#07090e] overflow-hidden select-none hairline-border rounded-lg flex flex-col">
      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Progressive Detail Breadcrumb & Mode */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0a0d14]/90 backdrop-blur-md px-3 py-1.5 rounded-md hairline-border text-xs">
          <span className="flex h-2 w-2 rounded-full bg-flame-500 animate-pulse" />
          <span className="font-mono text-zinc-400">DETAIL:</span>
          <span className="font-mono font-semibold text-white">
            {zoomLevel < 1.6 ? "Global View" : zoomLevel < 2.5 ? "Sub-Continental Grid" : "Localized Sector (375m)"}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono text-[11px]">
            {filteredRegions.length} Active Hotspot Sectors
          </span>
        </div>

        {/* Right: Quick Layer Pills */}
        {!isHeroPreview && (
          <div className="flex items-center gap-1 pointer-events-auto bg-[#0a0d14]/90 backdrop-blur-md p-1 rounded-md hairline-border text-[11px] font-mono">
            <button
              onClick={() => setShowObservations(!showObservations)}
              className={`px-2 py-1 rounded transition-colors ${
                showObservations ? "bg-flame-500/20 text-flame-400 border border-flame-500/40" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              FRP Points
            </button>
            <button
              onClick={() => setShowHeatZones(!showHeatZones)}
              className={`px-2 py-1 rounded transition-colors ${
                showHeatZones ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Heat Zones
            </button>
            <button
              onClick={() => setShowRiskLayer(!showRiskLayer)}
              className={`px-2 py-1 rounded transition-colors ${
                showRiskLayer ? "bg-ember-500/20 text-ember-400 border border-ember-500/40" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Risk Overlay
            </button>
            <button
              onClick={() => setShowDensityGrid(!showDensityGrid)}
              className={`px-2 py-1 rounded transition-colors ${
                showDensityGrid ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              0.5° Grid
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Map */}
      <div
        className="w-full flex-1 cursor-grab active:cursor-grabbing relative overflow-hidden bg-[#05070a]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 800 440"
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${center.x}px, ${center.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            {/* Radial glow gradients */}
            <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#ea580c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="extremeRiskGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <pattern id="gridHex" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Grid Lines */}
          <rect width="800" height="440" fill="#06080e" />
          <rect width="800" height="440" fill="url(#gridHex)" />

          {/* Stylized Simplified Continents Outlines */}
          <g fill="#0e131d" stroke="#1c2536" strokeWidth="0.8">
            {/* North America */}
            <path d="M 80 50 L 170 40 L 230 65 L 210 115 L 185 130 L 195 160 L 160 175 L 140 210 L 120 180 L 75 140 L 60 100 Z" />
            {/* South America */}
            <path d="M 190 230 L 260 250 L 270 320 L 230 390 L 205 385 L 195 300 L 180 250 Z" />
            {/* Eurasia */}
            <path d="M 360 45 L 520 40 L 690 60 L 720 110 L 670 170 L 610 190 L 520 180 L 460 210 L 420 180 L 370 140 L 365 90 Z" />
            {/* Africa */}
            <path d="M 370 180 L 450 175 L 480 230 L 460 330 L 420 370 L 380 340 L 350 250 L 355 200 Z" />
            {/* Australia */}
            <path d="M 640 270 L 730 265 L 750 330 L 710 370 L 645 350 L 630 300 Z" />
          </g>

          {/* Latitude and Longitude Graticules */}
          <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 3">
            <line x1="0" y1="110" x2="800" y2="110" />
            <line x1="0" y1="220" x2="800" y2="220" />
            <line x1="0" y1="330" x2="800" y2="330" />
            <line x1="200" y1="0" x2="200" y2="440" />
            <line x1="400" y1="0" x2="400" y2="440" />
            <line x1="600" y1="0" x2="600" y2="440" />
          </g>

          {/* Density Grid Cells Overlay (0.5 degree representation) */}
          {showDensityGrid && (
            <g stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.4" fill="none">
              {Array.from({ length: 40 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="440" />
              ))}
              {Array.from({ length: 22 }).map((_, j) => (
                <line key={`h-${j}`} x1="0" y1={j * 20} x2="800" y2={j * 20} />
              ))}
            </g>
          )}

          {/* Heat Zones Buffer Layer */}
          {showHeatZones &&
            filteredRegions.map((r) => {
              const { x, y } = project(r.lat, r.lon);
              const radius = Math.min(Math.max(r.mean_frp * 0.35, 12), 45);
              const isExtreme = r.risk_tier.includes("Extreme");
              return (
                <circle
                  key={`heat-${r.id}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={isExtreme ? "url(#extremeRiskGlow)" : "url(#heatGlow)"}
                  opacity="0.6"
                />
              );
            })}

          {/* Active Hotspot Points & Risk Rings */}
          {filteredRegions.map((r) => {
            const { x, y } = project(r.lat, r.lon);
            const isSelected = selectedRegion?.id === r.id;
            const isExtreme = r.risk_tier.includes("Extreme");
            const isHigh = r.risk_tier.includes("High");
            
            const markerColor = isExtreme ? "#ef4444" : isHigh ? "#f97316" : "#eab308";

            return (
              <g
                key={r.id}
                className="cursor-pointer group"
                onClick={() => handleRegionClick(r)}
              >
                {/* Outer animated radar ring for selected or extreme */}
                {(isSelected || isExtreme) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "14" : "10"}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={isSelected ? "1.5" : "0.8"}
                    strokeDasharray={isSelected ? "2 2" : undefined}
                    opacity="0.75"
                    className="animate-spin-slow"
                  />
                )}

                {/* Core FRP circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "5" : "3.5"}
                  fill={markerColor}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  className="transition-transform group-hover:scale-125"
                />

                {/* Progressive text label on zoom */}
                {zoomLevel >= 1.5 && (
                  <text
                    x={x + 7}
                    y={y + 3}
                    fill="#e5e7eb"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="500"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {r.name.split(" ")[0]} ({r.mean_frp} MW)
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#0a0d14]/90 backdrop-blur-md px-3 py-2 rounded-md hairline-border text-[11px] font-mono text-zinc-300 pointer-events-none space-y-1">
          <div className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">
            FRP & Risk Index
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ember-500" /> Extreme Risk (&gt;80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-flame-500" /> High Risk (55-80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-solar-500" /> Moderate (25-55%)
            </span>
          </div>
        </div>

        {/* Map Navigation Buttons */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-[#0a0d14]/90 hover:bg-[#151c2a] text-zinc-300 hover:text-white rounded hairline-border transition-colors shadow"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-[#0a0d14]/90 hover:bg-[#151c2a] text-zinc-300 hover:text-white rounded hairline-border transition-colors shadow"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-[#0a0d14]/90 hover:bg-[#151c2a] text-zinc-300 hover:text-white rounded hairline-border transition-colors shadow"
            title="Reset Orientation"
            aria-label="Reset Orientation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contextual Intelligence Drawer (Right side popout or bottom on mobile) */}
      {selectedRegion && !isHeroPreview && (
        <div className="w-full border-t border-white/10 bg-[#090c13] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Header & Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-flame-500/10 text-flame-400 hairline-border border-flame-500/30">
                {selectedRegion.id}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedRegion.region}, {selectedRegion.country}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  selectedRegion.risk_tier.includes("Extreme")
                    ? "bg-ember-500/20 text-ember-400 border border-ember-500/40"
                    : selectedRegion.risk_tier.includes("High")
                    ? "bg-flame-500/20 text-flame-400 border border-flame-500/40"
                    : "bg-solar-500/20 text-solar-400 border border-solar-500/40"
                }`}
              >
                {selectedRegion.risk_tier} ({selectedRegion.risk_score}%)
              </span>
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              {selectedRegion.name}
              <span className="text-xs text-zinc-500 font-normal">({selectedRegion.biome})</span>
            </h3>
            <div className="text-xs text-zinc-400 font-mono">
              Coordinates: {selectedRegion.lat.toFixed(2)}°N, {selectedRegion.lon.toFixed(2)}°W | 7-Day Trend:{" "}
              <span className={selectedRegion.trend_7d.startsWith("+") ? "text-ember-400 font-semibold" : "text-emerald-400"}>
                {selectedRegion.trend_7d}
              </span>
            </div>
          </div>

          {/* Quantitative Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono w-full md:w-auto">
            <div className="bg-black/30 p-2.5 rounded hairline-border">
              <div className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
                <Flame className="h-3 w-3 text-flame-400" /> Mean FRP
              </div>
              <div className="text-white text-sm font-semibold mt-0.5">{selectedRegion.mean_frp} MW</div>
              <div className="text-[10px] text-zinc-500">Peak: {selectedRegion.peak_frp} MW</div>
            </div>

            <div className="bg-black/30 p-2.5 rounded hairline-border">
              <div className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-ember-400" /> Surface Temp
              </div>
              <div className="text-white text-sm font-semibold mt-0.5">{selectedRegion.temp_c}°C</div>
              <div className="text-[10px] text-zinc-500">VPD: {selectedRegion.vpd_kpa} kPa</div>
            </div>

            <div className="bg-black/30 p-2.5 rounded hairline-border">
              <div className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-400" /> Soil Moisture
              </div>
              <div className="text-white text-sm font-semibold mt-0.5">{selectedRegion.soil_pct}%</div>
              <div className="text-[10px] text-zinc-500">Severe Deficit</div>
            </div>

            <div className="bg-black/30 p-2.5 rounded hairline-border">
              <div className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
                <Wind className="h-3 w-3 text-zinc-400" /> Surface Wind
              </div>
              <div className="text-white text-sm font-semibold mt-0.5">{selectedRegion.wind_kmh} km/h</div>
              <div className="text-[10px] text-zinc-500">{selectedRegion.detections} VIIRS Detections</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
