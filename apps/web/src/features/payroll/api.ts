import { api } from "@/lib/api";
import type { Payroll, PayrollListResponse, PayrollPeriod, PayrollStatus, SalaryComponent, SalaryComponentType } from "./types";

export async function listPayrolls(filters: { page: number; limit: number; payrollPeriodId?: string; status?: PayrollStatus | "" }) {
  const { data } = await api.get<PayrollListResponse>("/payrolls", { params: filters });
  return data;
}

export async function getPayroll(id: string) {
  const { data } = await api.get<Payroll>(`/payrolls/${id}`);
  return data;
}

export async function getPayslip(id: string) {
  const { data } = await api.get(`/payrolls/${id}/payslip`);
  return data;
}

export async function listPeriods() {
  const { data } = await api.get<PayrollPeriod[]>("/payrolls/periods");
  return data;
}

export async function createPeriod(payload: { code: string; name: string; startDate: string; endDate: string; paymentDate?: string }) {
  const { data } = await api.post<PayrollPeriod>("/payrolls/periods", compact(payload));
  return data;
}

export async function generatePayroll(periodId: string, employeeId?: string) {
  const { data } = await api.post<Payroll[]>(`/payrolls/periods/${periodId}/generate`, compact({ employeeId }));
  return data;
}

export async function lockPeriod(periodId: string) {
  const { data } = await api.post<PayrollPeriod>(`/payrolls/periods/${periodId}/lock`);
  return data;
}

export function exportPayrollCsvUrl(periodId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/payrolls/periods/${periodId}/export.csv`;
}

export async function listSalaryComponents() {
  const { data } = await api.get<SalaryComponent[]>("/payrolls/salary-components");
  return data;
}

export async function createSalaryComponent(payload: {
  code: string;
  name: string;
  type: SalaryComponentType;
  defaultAmount?: number;
  isTaxable?: boolean;
}) {
  const { data } = await api.post<SalaryComponent>("/payrolls/salary-components", compact(payload));
  return data;
}

export async function assignEmployeeComponent(employeeId: string, payload: { salaryComponentId: string; amount: number; effectiveFrom: string; effectiveTo?: string }) {
  const { data } = await api.post(`/payrolls/employees/${employeeId}/components`, compact(payload));
  return data;
}

function compact<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined));
}
