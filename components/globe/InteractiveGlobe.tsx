"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Simplified continent outlines as [lon, lat] segments
const CONTINENTS: number[][][] = [
  // North America
  [[-130,50],[-125,60],[-110,68],[-95,72],[-80,70],[-65,60],[-55,48],[-68,44],[-75,35],[-82,25],[-97,25],[-105,20],[-118,33],[-125,42],[-130,50]],
  // South America
  [[-82,8],[-70,12],[-60,5],[-50,0],[-35,-5],[-38,-15],[-42,-23],[-50,-28],[-55,-34],[-66,-55],[-75,-45],[-72,-18],[-82,8]],
  // Europe
  [[-10,36],[0,38],[5,44],[2,50],[-5,55],[5,58],[12,55],[15,60],[25,70],[35,70],[40,60],[30,45],[25,36],[10,36],[-10,36]],
  // Africa
  [[-17,15],[-5,35],[10,37],[30,32],[35,30],[42,12],[50,2],[40,-15],[35,-30],[20,-35],[15,-25],[12,-5],[0,5],[-17,15]],
  // Asia
  [[25,36],[30,45],[40,60],[50,55],[60,60],[80,70],[110,72],[140,68],[160,62],[170,55],[145,45],[130,35],[122,25],[105,10],[95,8],[80,10],[75,15],[68,22],[60,25],[42,12],[35,30],[25,36]],
  // Australia
  [[115,-35],[115,-25],[130,-12],[142,-10],[150,-15],[154,-25],[148,-38],[135,-35],[115,-35]],
];

export interface FirePointItem {
  id?: string;
  lat: number;
  lon: number;
  frp?: number;
  mean_frp?: number;
  peak_frp?: number;
  name: string;
  risk_tier?: string;
  risk_score?: number;
  biome?: string;
  country?: string;
  trend_7d?: string;
}

interface GlobeProps {
  firePoints: FirePointItem[];
  onSelectPoint?: (point: FirePointItem) => void;
  selectedPointId?: string;
  showLabels?: boolean;
  autoRotate?: boolean;
}

export const InteractiveGlobe: React.FC<GlobeProps> = ({
  firePoints,
  onSelectPoint,
  selectedPointId,
  showLabels = true,
  autoRotate = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [rotation, setRotation] = useState({ lon: -30, lat: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<FirePointItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const dragStartRef = useRef({ x: 0, y: 0, lon: 0, lat: 0 });
  const totalDragDistanceRef = useRef(0);
  const projectedPointsRef = useRef<{ point: FirePointItem; x: number; y: number; r: number }[]>([]);
  const pulseRef = useRef(0);

  const toRad = (d: number) => (d * Math.PI) / 180;

  const project = useCallback(
    (lat: number, lon: number, R: number, cx: number, cy: number, rotLon: number, rotLat: number) => {
      const la = toRad(lat);
      const lo = toRad(lon - rotLon);
      const rl = toRad(rotLat);
      const x = R * Math.cos(la) * Math.sin(lo);
      const y = R * (Math.cos(rl) * Math.sin(la) - Math.sin(rl) * Math.cos(la) * Math.cos(lo));
      const z = Math.sin(rl) * Math.sin(la) + Math.cos(rl) * Math.cos(la) * Math.cos(lo);
      return { x: cx + x, y: cy - y, visible: z > 0 };
    },
    []
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, rLon: number, rLat: number, pulse: number) => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w * dpr, h * dpr);

      const cx = (w * dpr) / 2;
      const cy = (h * dpr) / 2;
      const R = Math.min(cx, cy) * 0.78;

      // 1. Atmosphere outer glow
      const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.3);
      atmoGrad.addColorStop(0, "rgba(249, 115, 22, 0.07)");
      atmoGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.02)");
      atmoGrad.addColorStop(1, "transparent");
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Globe sphere background
      const globeGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
      globeGrad.addColorStop(0, "#151824");
      globeGrad.addColorStop(0.7, "#0c0e15");
      globeGrad.addColorStop(1, "#07080c");
      ctx.fillStyle = globeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Globe boundary ring
      ctx.strokeStyle = "rgba(255,255,255,0.09)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Latitude graticules
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 0.6;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const p = project(lat, lon, R, cx, cy, rLon, rLat);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 4. Longitude graticules
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 4) {
          const p = project(lat, lon, R, cx, cy, rLon, rLat);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 5. Continents
      ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 0.9;
      for (const segment of CONTINENTS) {
        ctx.beginPath();
        let started = false;
        const visiblePts: { x: number; y: number }[] = [];
        for (const [lon, lat] of segment) {
          const p = project(lat, lon, R, cx, cy, rLon, rLat);
          if (p.visible) {
            if (!started) {
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
            visiblePts.push(p);
          } else {
            started = false;
          }
        }
        if (visiblePts.length > 2) ctx.fill();
        ctx.stroke();
      }

      // 6. Fire nodes & prediction markings
      const projectedList: { point: FirePointItem; x: number; y: number; r: number }[] = [];

      for (const fp of firePoints) {
        const p = project(fp.lat, fp.lon, R, cx, cy, rLon, rLat);
        if (!p.visible) continue;

        const frpVal = fp.frp ?? fp.mean_frp ?? 40;
        const isExtreme = fp.risk_tier?.includes("Extreme") || (fp.risk_score && fp.risk_score > 80);
        const isHigh = fp.risk_tier?.includes("High") || (fp.risk_score && fp.risk_score >= 55);
        const color = isExtreme ? "#ef4444" : isHigh ? "#f97316" : "#eab308";
        const isSelected = selectedPointId && fp.id === selectedPointId;

        const intensity = Math.min(frpVal / 90, 1);
        const markerR = 3.5 + intensity * 4.5;

        projectedList.push({
          point: fp,
          x: p.x / dpr,
          y: p.y / dpr,
          r: markerR + 4,
        });

        // Outer pulsing predictive risk halo
        const pulseFactor = 1 + Math.sin(pulse + (fp.lat * 0.1)) * 0.25;
        const haloR = (markerR * 3.2 + (isExtreme ? 6 : 3)) * pulseFactor;

        const glow = ctx.createRadialGradient(p.x, p.y, markerR * 0.5, p.x, p.y, haloR);
        glow.addColorStop(0, isExtreme ? "rgba(239, 68, 68, 0.45)" : isHigh ? "rgba(249, 115, 22, 0.4)" : "rgba(234, 179, 8, 0.35)");
        glow.addColorStop(0.6, isExtreme ? "rgba(239, 68, 68, 0.1)" : "rgba(249, 115, 22, 0.08)");
        glow.addColorStop(1, "transparent");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Selection or extreme ring
        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, markerR * 2.4, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle crosshairs
          ctx.strokeStyle = "rgba(255,255,255,0.6)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - markerR * 3, p.y);
          ctx.lineTo(p.x - markerR * 1.5, p.y);
          ctx.moveTo(p.x + markerR * 1.5, p.y);
          ctx.lineTo(p.x + markerR * 3, p.y);
          ctx.moveTo(p.x, p.y - markerR * 3);
          ctx.lineTo(p.x, p.y - markerR * 1.5);
          ctx.moveTo(p.x, p.y + markerR * 1.5);
          ctx.lineTo(p.x, p.y + markerR * 3);
          ctx.stroke();
        }

        // Core marker dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, markerR, 0, Math.PI * 2);
        ctx.fill();

        // Bright white center specular
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x - markerR * 0.3, p.y - markerR * 0.3, markerR * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Optional label on hover/selected
        if (showLabels && (isSelected || (fp.risk_score && fp.risk_score > 85))) {
          ctx.font = `600 ${Math.round(10 * dpr)}px monospace`;
          ctx.fillStyle = "#ffffff";
          const label = `${fp.name.split(" ")[0]} (${fp.risk_score ? fp.risk_score + "%" : Math.round(frpVal) + "MW"})`;
          ctx.fillText(label, p.x + markerR * 1.8, p.y + 3 * dpr);
        }
      }

      projectedPointsRef.current = projectedList;
    },
    [project, firePoints, selectedPointId, showLabels]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      draw(ctx, rect.width, rect.height, rotation.lon, rotation.lat, pulseRef.current);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let rLon = rotation.lon;

    const animate = () => {
      pulseRef.current += 0.04;
      if (autoRotate && !isDragging) {
        rLon += 0.14;
        setRotation((prev) => ({ ...prev, lon: rLon }));
      }
      const rect = canvas.getBoundingClientRect();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      draw(ctx, rect.width, rect.height, rLon, rotation.lat, pulseRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [draw, autoRotate, isDragging, rotation.lat, rotation.lon]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    totalDragDistanceRef.current = 0;
    dragStartRef.current = { x: e.clientX, y: e.clientY, lon: rotation.lon, lat: rotation.lat };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      totalDragDistanceRef.current += Math.hypot(dx, dy);
      setRotation({
        lon: dragStartRef.current.lon + dx * 0.35,
        lat: Math.max(-65, Math.min(65, dragStartRef.current.lat - dy * 0.35)),
      });
      setHoveredPoint(null);
      setHoverPos(null);
    } else {
      // Hover detection on projected points
      let match: FirePointItem | null = null;
      for (const item of projectedPointsRef.current) {
        const dist = Math.hypot(mouseX - item.x, mouseY - item.y);
        if (dist <= item.r + 6) {
          match = item.point;
          break;
        }
      }
      setHoveredPoint(match);
      setHoverPos(match ? { x: mouseX, y: mouseY } : null);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && totalDragDistanceRef.current < 6 && hoveredPoint && onSelectPoint) {
      onSelectPoint(hoveredPoint);
    }
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (totalDragDistanceRef.current >= 6) return;
    const canvas = canvasRef.current;
    if (!canvas || !onSelectPoint) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const item of projectedPointsRef.current) {
      const dist = Math.hypot(mouseX - item.x, mouseY - item.y);
      if (dist <= item.r + 8) {
        onSelectPoint(item.point);
        break;
      }
    }
  };

  return (
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${hoveredPoint ? "cursor-pointer" : isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoveredPoint(null);
          setHoverPos(null);
        }}
        onClick={handleClick}
      />

      {/* Floating Hover Tooltip */}
      {hoveredPoint && hoverPos && !isDragging && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-2 rounded-md border mono text-[11px] shadow-xl transition-opacity"
          style={{
            left: `${hoverPos.x + 14}px`,
            top: `${hoverPos.y - 30}px`,
            background: "rgba(12, 15, 22, 0.95)",
            borderColor: "rgba(249, 115, 22, 0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="font-semibold text-white">{hoveredPoint.name}</div>
          <div className="flex items-center gap-2 mt-0.5" style={{ color: "var(--text-secondary)" }}>
            <span>{hoveredPoint.country || hoveredPoint.biome}</span>
            <span style={{ color: "var(--border)" }}>•</span>
            <span className={hoveredPoint.risk_tier?.includes("Extreme") ? "text-red-400 font-semibold" : "text-orange-400 font-semibold"}>
              {hoveredPoint.risk_score ? `${hoveredPoint.risk_score}% Risk` : `${hoveredPoint.mean_frp || hoveredPoint.frp} MW`}
            </span>
          </div>
          <div className="text-[9px] text-[#8b8d98] mt-1">Click to inspect ML telemetry</div>
        </div>
      )}
    </div>
  );
};
