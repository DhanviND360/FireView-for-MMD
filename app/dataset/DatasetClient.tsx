"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";

interface RawRecord {
  latitude: number;
  longitude: number;
  bright_ti4: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string;
  version: string;
  bright_ti5: number;
  frp: number;
  daynight: string;
}

interface FeatureMeta {
  column: string;
  type: string;
  unit: string;
  range: string;
  description: string;
  completeness: string;
}

interface SourceInfo {
  dataset_title?: string;
  provider?: string;
  instruments?: string[];
  spatial_resolution?: string;
  temporal_coverage?: string;
  full_archive_size?: string;
  file_format?: string;
  license?: string;
  citation?: string;
}

interface SchemaData {
  source_information: SourceInfo;
  features: FeatureMeta[];
}

interface Props {
  records: RawRecord[];
  rawCsv: string;
  schema: SchemaData;
}

type SortColumn = keyof RawRecord;

export const DatasetClient: React.FC<Props> = ({ records, rawCsv, schema }) => {
  // State
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [dayNightFilter, setDayNightFilter] = useState<string>("all");
  const [satelliteFilter, setSatelliteFilter] = useState<string>("all");
  const [minFrpFilter, setMinFrpFilter] = useState<number>(0);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [copied, setCopied] = useState(false);

  // Sorting
  const [sortCol, setSortCol] = useState<SortColumn>("acq_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleSort = (column: SortColumn) => {
    if (sortCol === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(column);
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setConfidenceFilter("all");
    setDayNightFilter("all");
    setSatelliteFilter("all");
    setMinFrpFilter(0);
    setCurrentPage(1);
  };

  const copyRawCsv = () => {
    navigator.clipboard.writeText(rawCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const match =
          r.acq_date.toLowerCase().includes(query) ||
          r.acq_time.toLowerCase().includes(query) ||
          r.latitude.toString().includes(query) ||
          r.longitude.toString().includes(query) ||
          r.confidence.toLowerCase().includes(query) ||
          r.satellite.toLowerCase().includes(query) ||
          r.frp.toString().includes(query);
        if (!match) return false;
      }

      // Confidence
      if (confidenceFilter !== "all" && r.confidence.toLowerCase() !== confidenceFilter.toLowerCase()) {
        return false;
      }

      // Day / Night
      if (dayNightFilter !== "all" && r.daynight !== dayNightFilter) {
        return false;
      }

      // Satellite
      if (satelliteFilter !== "all" && r.satellite !== satelliteFilter) {
        return false;
      }

      // Min FRP
      if (minFrpFilter > 0 && r.frp < minFrpFilter) {
        return false;
      }

      return true;
    });
  }, [records, searchTerm, confidenceFilter, dayNightFilter, satelliteFilter, minFrpFilter]);

  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let aVal = a[sortCol];
      let bVal = b[sortCol];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return list;
  }, [filteredRecords, sortCol, sortDir]);

  // Paginated records
  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRecords.slice(start, start + rowsPerPage);
  }, [sortedRecords, currentPage, rowsPerPage]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white tracking-tight">Raw Satellite Telemetry CSV</h1>
            <span
              className="px-2 py-0.5 rounded text-[10px] mono font-semibold border"
              style={{ background: "var(--accent-dim)", borderColor: "rgba(249,115,22,0.3)", color: "#f97316" }}
            >
              RFC 4180 CSV
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            NASA FIRMS VIIRS 375m active fire raw observations, spatial scan footprints, and calibrated radiometry.
          </p>
        </div>

        {/* View mode toggle + Download CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center p-0.5 rounded-lg border text-[11px] mono"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === "table" ? "bg-orange-500 text-white font-semibold" : "text-[#8b8d98] hover:text-white"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Data Grid</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === "raw" ? "bg-orange-500 text-white font-semibold" : "text-[#8b8d98] hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Raw CSV</span>
            </button>
          </div>

          <a
            href="/data/viirs_sample_375m.csv"
            download="viirs_375m_active_fire_sample.csv"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] mono font-medium transition-colors"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          >
            <Download className="h-3.5 w-3.5 text-orange-400" />
            <span>Download CSV</span>
          </a>
        </div>
      </div>

      {/* 1. CSV Source Information Strip */}
      <div
        className="rounded-lg border overflow-hidden transition-all"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setShowSource(!showSource)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-semibold text-white tracking-tight">CSV Source & Provenance Metadata</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mono" style={{ color: "var(--text-tertiary)" }}>
            <span>NASA LANCE / EOSDIS</span>
            {showSource ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </button>

        {showSource && (
          <div className="px-4 pb-4 pt-2 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mono text-[11px]">
              <div className="p-2.5 rounded border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Data Provider:</span>
                <div className="text-white font-semibold mt-0.5 truncate">
                  {schema.source_information.provider || "NASA LANCE / FIRMS"}
                </div>
              </div>
              <div className="p-2.5 rounded border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Sensor / Orbiters:</span>
                <div className="text-white font-semibold mt-0.5 truncate">Suomi NPP & NOAA-20 VIIRS</div>
              </div>
              <div className="p-2.5 rounded border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Spatial Resolution:</span>
                <div className="text-orange-400 font-semibold mt-0.5">375 m at nadir</div>
              </div>
              <div className="p-2.5 rounded border" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Full Archive Volume:</span>
                <div className="text-white font-semibold mt-0.5">1.22 GB · 4,812,490 obs</div>
              </div>
            </div>

            {/* Original Dataset Archive Access Card */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border"
              style={{ background: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.25)" }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Full NASA FIRMS Original Dataset Archive</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    1.22 GB · 4.81M ROWS
                  </span>
                </div>
                <p className="text-[11px] text-[#8b8d98] max-w-2xl leading-relaxed">
                  To prevent client memory overload and ensure instant edge rendering, this in-browser view displays the first 100 representative observations. The full global archive can be downloaded directly from NASA FIRMS.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://firms.modaps.eosdis.nasa.gov/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold tracking-wide transition-colors"
                >
                  <span>NASA FIRMS Archive</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://www.earthdata.nasa.gov/learn/find-data/near-real-time/firms/viirs-i-band-375-m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:text-white"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span>Earthdata Spec</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <span className="font-semibold text-white">Citation: </span>
              {schema.source_information.citation ||
                "Schroeder et al. (2014). The New VIIRS 375 m active fire detection data product. Remote Sensing of Environment."}
            </p>
          </div>
        )}
      </div>

      {/* 2. Data Features (Schema Dictionary) */}
      <div
        className="rounded-lg border overflow-hidden transition-all"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-semibold text-white tracking-tight">
              Data Features Dictionary ({schema.features.length} columns)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] mono" style={{ color: "var(--text-tertiary)" }}>
            <span>Schema Details</span>
            {showFeatures ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </button>

        {showFeatures && (
          <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {schema.features.map((feat) => (
                <div
                  key={feat.column}
                  className="p-2.5 rounded border mono text-[11px] space-y-1"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white tracking-tight">{feat.column}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded text-orange-400 bg-orange-950/40 border border-orange-900/50">
                      {feat.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8b8d98] truncate">{feat.description}</div>
                  <div className="flex items-center justify-between text-[10px] pt-1" style={{ color: "var(--text-tertiary)" }}>
                    <span>Unit: <span className="text-white">{feat.unit}</span></span>
                    <span>Range: <span className="text-white">{feat.range}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Filters & Controls */}
      <div
        className="p-3.5 rounded-lg border space-y-3 mono text-[11px]"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border flex-1 min-w-[200px]"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
          >
            <Search className="h-3.5 w-3.5 text-[#5c5e6a]" />
            <input
              type="text"
              placeholder="Search by date, coordinates, satellite, FRP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white text-xs w-full focus:outline-none placeholder-[#5c5e6a]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-[#5c5e6a] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-[#8b8d98] mr-1">Conf:</span>
            {(["all", "high", "nominal", "low"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setConfidenceFilter(lvl);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  confidenceFilter === lvl ? "bg-orange-500 text-white font-semibold" : "text-[#8b8d98] hover:text-white"
                }`}
                style={confidenceFilter !== lvl ? { background: "var(--bg)" } : undefined}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Day / Night Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-[#8b8d98] mr-1">D/N:</span>
            {(["all", "D", "N"] as const).map((dn) => (
              <button
                key={dn}
                onClick={() => {
                  setDayNightFilter(dn);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  dayNightFilter === dn ? "bg-orange-500 text-white font-semibold" : "text-[#8b8d98] hover:text-white"
                }`}
                style={dayNightFilter !== dn ? { background: "var(--bg)" } : undefined}
              >
                {dn === "all" ? "All" : dn === "D" ? "Day" : "Night"}
              </button>
            ))}
          </div>

          {/* Min FRP Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase text-[#8b8d98] mr-1">FRP:</span>
            {[
              { label: "All", val: 0 },
              { label: ">25 MW", val: 25 },
              { label: ">50 MW", val: 50 },
              { label: ">100 MW", val: 100 },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => {
                  setMinFrpFilter(f.val);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                  minFrpFilter === f.val ? "bg-orange-500 text-white font-semibold" : "text-[#8b8d98] hover:text-white"
                }`}
                style={minFrpFilter !== f.val ? { background: "var(--bg)" } : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          {(searchTerm || confidenceFilter !== "all" || dayNightFilter !== "all" || minFrpFilter > 0) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] text-[#ef4444] hover:bg-red-950/40 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Counter & Active Sort Strip */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div style={{ color: "var(--text-secondary)" }}>
            Showing <span className="text-white font-semibold">{sortedRecords.length}</span> of{" "}
            <span className="text-white font-semibold">{records.length}</span> records
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Sorted by <span className="text-orange-400 font-semibold">{sortCol}</span> ({sortDir.toUpperCase()}) · Click headers to sort
          </div>
        </div>
      </div>

      {/* 4. The CSV View (Table vs Raw Text) */}
      {viewMode === "table" ? (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left mono text-[11px]">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}>
                  {[
                    { col: "acq_date" as SortColumn, label: "Date" },
                    { col: "acq_time" as SortColumn, label: "Time (UTC)" },
                    { col: "latitude" as SortColumn, label: "Latitude" },
                    { col: "longitude" as SortColumn, label: "Longitude" },
                    { col: "frp" as SortColumn, label: "FRP (MW)" },
                    { col: "bright_ti4" as SortColumn, label: "Ti4 (K)" },
                    { col: "bright_ti5" as SortColumn, label: "Ti5 (K)" },
                    { col: "confidence" as SortColumn, label: "Confidence" },
                    { col: "daynight" as SortColumn, label: "D/N" },
                    { col: "satellite" as SortColumn, label: "Satellite" },
                    { col: "scan" as SortColumn, label: "Scan (km)" },
                    { col: "track" as SortColumn, label: "Track (km)" },
                  ].map((h) => (
                    <th
                      key={h.col}
                      onClick={() => handleSort(h.col)}
                      className="p-3 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>{h.label}</span>
                        {sortCol === h.col ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-orange-400" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-orange-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-2.5 w-2.5 opacity-30" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {paginatedRecords.map((r, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3 text-white font-medium">{r.acq_date}</td>
                    <td className="p-3 text-[#8b8d98]">{r.acq_time}</td>
                    <td className="p-3 text-white">{r.latitude.toFixed(4)}°</td>
                    <td className="p-3 text-white">{r.longitude.toFixed(4)}°</td>
                    <td className="p-3 font-bold text-orange-400">{r.frp.toFixed(1)}</td>
                    <td className="p-3 text-white">{r.bright_ti4.toFixed(1)}</td>
                    <td className="p-3 text-[#8b8d98]">{r.bright_ti5.toFixed(1)}</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.confidence === "high"
                            ? "text-emerald-400 bg-emerald-950/50 border border-emerald-800/40"
                            : r.confidence === "nominal"
                            ? "text-amber-400 bg-amber-950/50 border border-amber-800/40"
                            : "text-zinc-400 bg-zinc-900 border border-zinc-800"
                        }`}
                      >
                        {r.confidence}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.daynight === "D" ? (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Sun className="h-3 w-3" />
                          <span>D</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-400">
                          <Moon className="h-3 w-3" />
                          <span>N</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[#8b8d98]">
                      {r.satellite === "N" ? "S-NPP" : "NOAA-20"}
                    </td>
                    <td className="p-3 text-[#5c5e6a]">{r.scan.toFixed(2)}</td>
                    <td className="p-3 text-[#5c5e6a]">{r.track.toFixed(2)}</td>
                  </tr>
                ))}
                {paginatedRecords.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-[#5c5e6a] mono text-xs">
                      No records match the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            className="flex items-center justify-between px-4 py-3 border-t mono text-[11px]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <span>Rows per page:</span>
              {[25, 50, 100].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setRowsPerPage(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded ${
                    rowsPerPage === size ? "bg-white/20 text-white font-bold" : "text-[#5c5e6a] hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span style={{ color: "var(--text-secondary)" }}>
                Page <span className="text-white font-semibold">{currentPage}</span> of{" "}
                <span className="text-white font-semibold">{totalPages}</span>
              </span>
              <div className="flex items-center gap-1 ml-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2 py-1 rounded border disabled:opacity-30 text-[#8b8d98] hover:text-white transition-colors"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  «
                </button>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border disabled:opacity-30 text-[#8b8d98] hover:text-white transition-colors"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border disabled:opacity-30 text-[#8b8d98] hover:text-white transition-colors"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  Next
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2 py-1 rounded border disabled:opacity-30 text-[#8b8d98] hover:text-white transition-colors"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Raw CSV Monospace View */
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold mono text-white">viirs_sample_375m.csv</span>
            <button
              onClick={copyRawCsv}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] mono text-[#8b8d98] hover:text-white transition-colors"
              style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            >
              {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied!" : "Copy CSV"}</span>
            </button>
          </div>

          <pre
            className="p-4 text-[11px] mono text-[#c5c6cd] overflow-x-auto max-h-[600px] leading-relaxed select-text"
            style={{ background: "#06070a" }}
          >
            {rawCsv.split("\n").slice(0, 150).join("\n")}
            {rawCsv.split("\n").length > 150 && (
              <span className="text-[#5c5e6a] italic block mt-2">
                ... [{rawCsv.split("\n").length - 150} more rows truncated in raw preview. Use 'Download CSV' for the full dataset]
              </span>
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
