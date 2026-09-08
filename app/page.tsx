import React from "react";
import fs from "fs";
import path from "path";
import { LandingClient } from "./LandingClient";

function getFirePoints() {
  try {
    const spatialPath = path.join(process.cwd(), "public", "data", "spatial_grid.json");
    const data = JSON.parse(fs.readFileSync(spatialPath, "utf-8"));
    return (data.primary_regions || []).map((r: any) => ({
      lat: r.lat,
      lon: r.lon,
      frp: r.mean_frp,
      name: r.name,
    }));
  } catch {
    return [];
  }
}

export default function LandingPage() {
  const firePoints = getFirePoints();
  return <LandingClient firePoints={firePoints} />;
}
