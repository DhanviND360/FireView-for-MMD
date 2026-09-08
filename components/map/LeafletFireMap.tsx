"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";

interface FireRegion {
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

interface LeafletFireMapProps {
  regions: FireRegion[];
  onSelectRegion?: (r: FireRegion) => void;
}

export const LeafletFireMap: React.FC<LeafletFireMapProps> = ({ regions, onSelectRegion }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 12,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Add fire markers
    for (const r of regions) {
      const isExtreme = r.risk_tier.includes("Extreme");
      const isHigh = r.risk_tier.includes("High");
      const color = isExtreme ? "#ef4444" : isHigh ? "#f97316" : "#eab308";
      const radius = Math.max(6, Math.min(r.mean_frp / 5, 18));

      // Outer glow circle
      L.circleMarker([r.lat, r.lon], {
        radius: radius * 2.5,
        fillColor: color,
        fillOpacity: 0.1,
        stroke: false,
      }).addTo(map);

      // Core marker
      const marker = L.circleMarker([r.lat, r.lon], {
        radius: radius,
        fillColor: color,
        fillOpacity: 0.85,
        color: "#ffffff",
        weight: 1,
        opacity: 0.4,
      }).addTo(map);

      // Popup
      marker.bindPopup(
        `<div style="font-family: ui-monospace, monospace; font-size: 11px; min-width: 200px; line-height: 1.6;">
          <div style="font-size: 13px; font-weight: 600; color: #e4e5e9; font-family: Inter, sans-serif; margin-bottom: 4px;">${r.name}</div>
          <div style="color: #8b8d98; margin-bottom: 8px;">${r.biome} · ${r.country}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; color: #c5c6cd;">
            <span style="color: #8b8d98;">Risk</span><span style="color: ${color}; font-weight: 600;">${r.risk_score}% ${isExtreme ? "Extreme" : isHigh ? "High" : "Moderate"}</span>
            <span style="color: #8b8d98;">Mean FRP</span><span>${r.mean_frp} MW</span>
            <span style="color: #8b8d98;">Peak FRP</span><span>${r.peak_frp} MW</span>
            <span style="color: #8b8d98;">Temp</span><span>${r.temp_c}°C</span>
            <span style="color: #8b8d98;">Soil</span><span>${r.soil_pct}%</span>
            <span style="color: #8b8d98;">Wind</span><span>${r.wind_kmh} km/h</span>
            <span style="color: #8b8d98;">7d Trend</span><span style="color: ${r.trend_7d.startsWith("+") ? "#ef4444" : "#22c55e"}; font-weight: 600;">${r.trend_7d}</span>
          </div>
        </div>`,
        { className: "fire-popup" }
      );

      marker.on("click", () => {
        if (onSelectRegion) onSelectRegion(r);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [regions, onSelectRegion]);

  return <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />;
};
