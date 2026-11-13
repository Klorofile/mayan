export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "REMOTE" | "ON_LEAVE";
export type LeaveStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type PayrollStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "PAID";

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  workDate: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
};

export type PayrollRun = {
  id: string;
  period: string;
  status: PayrollStatus;
  totalGross: number;
  totalNet: number;
};
