export type LeaveStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveType = {
  id: string;
  code: string;
  name: string;
  annualQuotaDays: string;
  isPaid: boolean;
  requiresApproval: boolean;
};

export type LeaveBalance = {
  id: string;
  year: number;
  openingBalance: string;
  accrued: string;
  used: string;
  remaining: string;
  leaveType: LeaveType;
  employee?: { fullName: string; employeeNumber: string };
};

export type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: string;
  reason: string;
  attachmentUrl?: string | null;
  status: LeaveStatus;
  managerApprovedAt?: string | null;
  hrApprovedAt?: string | null;
  approvalNote?: string | null;
  employee: { fullName: string; employeeNumber: string };
  leaveType: LeaveType;
};

export type LeaveListResponse = {
  data: LeaveRequest[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
