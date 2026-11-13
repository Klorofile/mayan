import { api } from "@/lib/api";
import type { AttendanceCorrection, AttendanceListResponse, AttendanceRecord, AttendanceStatus } from "./types";

export type AttendanceFilters = {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus | "";
  employeeId?: string;
};

export type ClockPayload = {
  employeeId?: string;
  attendanceDate?: string;
  latitude: number;
  longitude: number;
  notes?: string;
};

export async function listAttendances(filters: AttendanceFilters) {
  const { data } = await api.get<AttendanceListResponse>("/attendances", { params: filters });
  return data;
}

export async function clockIn(payload: ClockPayload) {
  const { data } = await api.post<AttendanceRecord>("/attendances/clock-in", payload);
  return data;
}

export async function clockOut(payload: ClockPayload) {
  const { data } = await api.post<AttendanceRecord>("/attendances/clock-out", payload);
  return data;
}

export async function requestCorrection(payload: {
  attendanceId?: string;
  employeeId?: string;
  requestedClockInAt?: string;
  requestedClockOutAt?: string;
  reason: string;
}) {
  const { data } = await api.post<AttendanceCorrection>("/attendances/corrections", compact(payload));
  return data;
}

export async function approveCorrection(id: string, reviewerNote?: string) {
  const { data } = await api.patch<AttendanceCorrection>(`/attendances/corrections/${id}/approve`, { reviewerNote });
  return data;
}

export async function rejectCorrection(id: string, reviewerNote?: string) {
  const { data } = await api.patch<AttendanceCorrection>(`/attendances/corrections/${id}/reject`, { reviewerNote });
  return data;
}

function compact<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));
}
