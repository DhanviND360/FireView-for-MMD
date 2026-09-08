import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Database, Satellite, Code2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#040609] hairline-border-t text-zinc-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: System Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-flame-500/20 hairline-border border-flame-500/30 flex items-center justify-center">
                <Flame className="h-3.5 w-3.5 text-flame-500" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">FireView</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 hairline-border text-zinc-400">
                Satellite MMD Platform
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              High-throughput satellite pattern mining platform processing multi-spectral active fire observations from NASA FIRMS Suomi-NPP, NOAA-20, and NOAA-21 VIIRS instruments at 375m spatial resolution.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Satellite className="h-3 w-3 text-flame-400" /> VIIRS 375m I-Band
              </span>
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3 text-zinc-400" /> 1.2 GB Scaled Footprint
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Zero-Fabrication Audit
              </span>
            </div>
          </div>

          {/* Col 2: Analytical Labs */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-300 font-semibold">
              Analytical Modules
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Global Fire Map</Link></li>
              <li><Link href="/eda" className="hover:text-white transition-colors">Exploratory Data Analysis Lab</Link></li>
              <li><Link href="/sampling" className="hover:text-white transition-colors">Sampling & Bias Engine</Link></li>
              <li><Link href="/mmd" className="hover:text-white transition-colors">MMD Algorithmic Core</Link></li>
              <li><Link href="/risk" className="hover:text-white transition-colors">Fire-Activity Risk Modeling</Link></li>
            </ul>
          </div>

          {/* Col 3: Scientific Principles */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-mono text-zinc-300 font-semibold">
              Scientific Provenance
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/evidence" className="hover:text-white transition-colors">Evidence & Verification</Link></li>
              <li><Link href="/alerts" className="hover:text-white transition-colors">Analytical Alerts & Spikes</Link></li>
              <li><Link href="/methodology" className="hover:text-white transition-colors">Pipeline Methodology</Link></li>
              <li>
                <span className="text-zinc-500">NASA FIRMS VNP14IMGTDL</span>
              </li>
              <li>
                <span className="text-zinc-500">Platt-Calibrated Classifiers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 hairline-border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px] font-mono">
          <div>
            &copy; {new Date().getFullYear()} FireView. Designed for Earth Observation & Massive Datasets Research.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              All metrics mathematically derived
            </span>
            <span>|</span>
            <span className="text-zinc-400">Strictly designated as fire-activity risk</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
