import { api } from "@/lib/api";
import type { DashboardSummary } from "./types";

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/dashboard/summary");
  return data;
}
