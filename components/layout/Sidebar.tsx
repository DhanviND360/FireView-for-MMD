"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  BarChart3,
  GitFork,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  Bell,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Flame,
  Database,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: Map },
  { label: "Raw Data", href: "/dataset", icon: Database },
  { label: "EDA Lab", href: "/eda", icon: BarChart3 },
  { label: "Sampling", href: "/sampling", icon: GitFork },
  { label: "MMD Engine", href: "/mmd", icon: Cpu },
  { label: "Risk Model", href: "/risk", icon: ShieldAlert },
  { label: "Evidence", href: "/evidence", icon: CheckCircle2 },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Methodology", href: "/methodology", icon: Workflow },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-subtle transition-all duration-200 ease-out ${
        collapsed ? "w-14" : "w-[220px]"
      }`}
      style={{ background: "var(--surface)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 h-12 border-b-subtle shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0" style={{ background: "var(--accent-dim)" }}>
            <Flame className="h-3.5 w-3.5 text-orange-500" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-white">FireView</span>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] font-medium transition-colors relative ${
                isActive
                  ? "text-white"
                  : "text-[#8b8d98] hover:text-[#c5c6cd] hover:bg-white/[0.04]"
              }`}
              style={isActive ? { background: "var(--accent-dim)" } : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-orange-500" />
              )}
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-orange-500" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t-subtle shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-md text-[#5c5e6a] hover:text-[#8b8d98] hover:bg-white/[0.04] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
