import React from "react";
import fs from "fs";
import path from "path";
import { DashboardClient } from "./DashboardClient";

function getData() {
  try {
    const spatial = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "spatial_grid.json"), "utf-8"));
    const alerts = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "data", "alerts_data.json"), "utf-8"));
    return { regions: spatial.primary_regions, alerts: alerts.alerts };
  } catch {
    return { regions: [], alerts: [] };
  }
}

export default function DashboardPage() {
  const { regions, alerts } = getData();
  return <DashboardClient regions={regions} alerts={alerts} />;
}
