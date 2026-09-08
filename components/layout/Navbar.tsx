"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  Layers, 
  BarChart3, 
  GitFork, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  Bell, 
  Workflow,
  Menu,
  X,
  Radio
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Overview Map", href: "/dashboard", icon: Layers },
    { label: "EDA Lab", href: "/eda", icon: BarChart3 },
    { label: "Sampling Lab", href: "/sampling", icon: GitFork },
    { label: "MMD Engine", href: "/mmd", icon: Cpu },
    { label: "Activity Risk", href: "/risk", icon: ShieldAlert },
    { label: "Evidence", href: "/evidence", icon: CheckCircle2 },
    { label: "Alerts", href: "/alerts", icon: Bell },
    { label: "Methodology", href: "/methodology", icon: Workflow },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#06080d]/90 backdrop-blur-md hairline-border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-flame-500/20 to-ember-500/10 hairline-border group-hover:border-flame-500/40 transition-colors">
              <Flame className="h-4 w-4 text-flame-500 transition-transform group-hover:scale-110" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-flame-500 animate-ping-slow" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
                FireView
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/5 text-flame-400 hairline-border">
                  MMD v2.4
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline-block">
                VIIRS 375m Satellite Intelligence
              </span>
            </div>
          </Link>

          {/* Live Ingestion Telemetry Tag */}
          <div className="hidden xl:flex items-center gap-2 pl-4 hairline-border-l text-[11px] text-zinc-400 font-mono">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>VIIRS I-Band Orbit: Active</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">4.8M Footprint</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-semibold hairline-border border-flame-500/30 text-shadow"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-flame-400" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-flame-500 hover:bg-flame-600 text-white transition-all shadow-sm font-mono"
          >
            <Radio className="h-3 w-3" />
            <span>Launch Command</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/5"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden px-4 py-3 bg-[#0a0d14] hairline-border-b space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md ${
                  isActive
                    ? "bg-flame-500/10 text-flame-400 font-medium hairline-border border-flame-500/30"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold rounded bg-flame-500 text-white font-mono"
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Launch Command Center</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
