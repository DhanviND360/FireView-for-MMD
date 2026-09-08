import React from "react";
import fs from "fs";
import path from "path";
import { DatasetClient } from "./DatasetClient";

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

function parseCsv(csvText: string, maxRows: number = 100): RawRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const records: RawRecord[] = [];
  const limit = Math.min(lines.length, maxRows + 1);

  for (let i = 1; i < limit; i++) {
    const vals = lines[i].split(",").map((v) => v.trim());
    if (vals.length < headers.length) continue;

    const row: any = {};
    headers.forEach((h, idx) => {
      const val = vals[idx];
      if (
        h === "latitude" ||
        h === "longitude" ||
        h === "bright_ti4" ||
        h === "scan" ||
        h === "track" ||
        h === "bright_ti5" ||
        h === "frp"
      ) {
        row[h] = parseFloat(val) || 0;
      } else {
        row[h] = val;
      }
    });
    records.push(row as RawRecord);
  }

  return records;
}

function getData() {
  try {
    const csvPath = path.join(process.cwd(), "public", "data", "viirs_sample_375m.csv");
    const rawCsv = fs.readFileSync(csvPath, "utf-8");
    const records = parseCsv(rawCsv);

    const schemaPath = path.join(process.cwd(), "public", "data", "csv_schema.json");
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

    return { records, rawCsv, schema };
  } catch (err) {
    console.error("Error reading CSV dataset:", err);
    return { records: [], rawCsv: "", schema: { source_information: {}, features: [] } };
  }
}

export default function DatasetPage() {
  const { records, rawCsv, schema } = getData();

  return <DatasetClient records={records} rawCsv={rawCsv} schema={schema} />;
}
