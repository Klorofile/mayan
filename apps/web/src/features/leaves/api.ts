import { api } from "@/lib/api";
import type { LeaveBalance, LeaveListResponse, LeaveRequest, LeaveStatus, LeaveType } from "./types";

export type LeaveFilters = {
  page: number;
  limit: number;
  status?: LeaveStatus | "";
  startDate?: string;
  endDate?: string;
};

export async function listLeaveTypes() {
  const { data } = await api.get<LeaveType[]>("/leaves/types");
  return data;
}

export async function listLeaveBalances() {
  const { data } = await api.get<LeaveBalance[]>("/leaves/balances", { params: { year: new Date().getFullYear() } });
  return data;
}

export async function listLeaves(filters: LeaveFilters) {
  const { data } = await api.get<LeaveListResponse>("/leaves", { params: filters });
  return data;
}

export async function applyLeave(payload: {
  employeeId?: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
}) {
  const { data } = await api.post<LeaveRequest>("/leaves", compact(payload));
  return data;
}

export async function managerApproveLeave(id: string, note?: string) {
  const { data } = await api.patch<LeaveRequest>(`/leaves/${id}/manager-approve`, { note });
  return data;
}

export async function hrApproveLeave(id: string, note?: string) {
  const { data } = await api.patch<LeaveRequest>(`/leaves/${id}/hr-approve`, { note });
  return data;
}

export async function rejectLeave(id: string, note?: string) {
  const { data } = await api.patch<LeaveRequest>(`/leaves/${id}/reject`, { note });
  return data;
}

export async function cancelLeave(id: string, note?: string) {
  const { data } = await api.patch<LeaveRequest>(`/leaves/${id}/cancel`, { note });
  return data;
}

export async function leaveCalendar(startDate: string, endDate: string) {
  const { data } = await api.get<LeaveRequest[]>("/leaves/calendar", { params: { startDate, endDate } });
  return data;
}

function compact<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));
}
