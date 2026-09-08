"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { InteractiveGlobe, FirePointItem } from "@/components/globe/InteractiveGlobe";

interface LandingClientProps {
  firePoints: FirePointItem[];
}

export const LandingClient: React.FC<LandingClientProps> = ({ firePoints }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden" style={{ background: "#06070b" }}>
      {/* Subtle radial ambient behind globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[750px] h-[750px] rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, rgba(239,68,68,0.04) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Top Tagline Badge */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2 z-10">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] mono tracking-wider uppercase"
          style={{
            background: "rgba(18, 21, 30, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: "var(--text-secondary)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>VIIRS 375m Satellite Intelligence</span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-white leading-[1.08] max-w-3xl">
          See Where Fire Is Building
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-red-500">
            Before It Becomes a Pattern.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Mining massive satellite fire streams into sub-millisecond pattern discovery,
          spatial propagation clustering, and calibrated fire-activity risk insights.
        </p>

        {/* Focused CTA Button to Main Dashboard */}
        <div className="flex items-center gap-4 mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.99] group"
          >
            <Flame className="h-4 w-4 text-white" />
            <span>Launch FireView Dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Interactive 3D Globe Section */}
      <div className="relative z-0 w-full max-w-[620px] h-[420px] sm:h-[480px] mt-4 globe-glow rounded-full mx-auto">
        <InteractiveGlobe firePoints={firePoints} showLabels={false} />
      </div>

      {/* Bottom Telemetry Strip */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 sm:gap-6 text-[11px] mono"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span>4.8M Observations</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>1.22 GB Analyzed</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>ROC-AUC 0.842</span>
        <span style={{ color: "var(--border)" }}>|</span>
        <span>12 Global Sectors Monitored</span>
      </div>
    </div>
  );
};
