import { api } from "@/lib/api";
import type { Employee, EmployeeListResponse, EmployeePayload, EmploymentStatus } from "./types";

export type EmployeeFilters = {
  page: number;
  limit: number;
  search?: string;
  departmentId?: string;
  status?: EmploymentStatus | "";
};

export async function listEmployees(filters: EmployeeFilters) {
  const { data } = await api.get<EmployeeListResponse>("/employees", { params: filters });
  return data;
}

export async function getEmployee(id: string) {
  const { data } = await api.get<Employee>(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload: EmployeePayload) {
  const { data } = await api.post<Employee>("/employees", compactPayload(payload));
  return data;
}

export async function updateEmployee(id: string, payload: EmployeePayload) {
  const { data } = await api.patch<Employee>(`/employees/${id}`, compactPayload(payload));
  return data;
}

function compactPayload(payload: EmployeePayload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));
}
